import {
  PLAYLIST_SONGS_ADD_SONGS_BY_PLAYLIST_ID,
  PLAYLIST_SONGS_REMOVE_PLAYLIST_SONGS_BY_ID,
} from '../constants/playlistSongsByIdTypes';
import { setPlaylistHydrating } from './playerActions';
import hydrateSongMetadata from '../../utils/hydrateSongMetadata';
import { writePlaylistCache } from '../../utils/playlistCache';

// videos.list simply omits deleted/private videos from its response (unlike the old
// playlistItems.list-based fetch, which returned a "Private video"/"Deleted video" title for
// them) — falling back to this label lets the UI show something more useful than a
// permanently-stuck "Loading…", and it doubles as the "already hydrated" marker so these
// songs aren't re-requested from the YouTube API on every future hydration pass.
export const UNAVAILABLE_VIDEO_TITLE = 'Video unavailable';

export const addSongsByPlaylistID = (payload) => ({
  type: PLAYLIST_SONGS_ADD_SONGS_BY_PLAYLIST_ID,
  payload,
});

export const removePlaylistSongsById = (payload) => ({
  type: PLAYLIST_SONGS_REMOVE_PLAYLIST_SONGS_BY_ID,
  payload,
});

export const hydrateRemainingSongs = (playlistId) => async (dispatch, getState) => {
  dispatch(setPlaylistHydrating({ playlistId, isHydrating: true })); // new player-slice flag

  try {
    let songs = getState().playlistSongsById[playlistId];
    const unhydratedIndexes = songs
      .map((song, index) => (song.snippet.title === null ? index : null))
      .filter((index) => index !== null);

    for (let i = 0; i < unhydratedIndexes.length; i += 50) {
      const chunkIndexes = unhydratedIndexes.slice(i, i + 50);
      // eslint-disable-next-line no-loop-func -- reads the current `songs` for this chunk only
      const chunkVideoIds = chunkIndexes.map((index) => songs[index].snippet.resourceId.videoId);
      // eslint-disable-next-line no-await-in-loop -- intentionally sequential, chunk by chunk
      const metadataByVideoId = await hydrateSongMetadata(chunkVideoIds);

      // eslint-disable-next-line no-loop-func -- reassigning `songs` for use by the next chunk is intentional
      songs = songs.map((song, index) => {
        if (!chunkIndexes.includes(index)) return song;
        const metadata = metadataByVideoId[song.snippet.resourceId.videoId];
        if (metadata) return { ...song, snippet: { ...song.snippet, ...metadata } };
        return {
          ...song,
          snippet: {
            ...song.snippet,
            title: UNAVAILABLE_VIDEO_TITLE,
            videoOwnerChannelTitle: '',
          },
        };
      });
      dispatch(addSongsByPlaylistID({ id: playlistId, songs })); // merge each chunk in as it arrives
    }

    const { userId } = getState().auth;
    const shuffledVideoIds = songs.map((song) => song.snippet.resourceId.videoId);
    writePlaylistCache(userId, playlistId, shuffledVideoIds, songs);
  } finally {
    // Always flips, even on failure (e.g. a chunk request throws) — otherwise the
    // hydratePlaylistWindow concurrency guard below would permanently block this
    // playlist from ever being (re-)hydrated again for the rest of the session.
    dispatch(setPlaylistHydrating({ playlistId, isHydrating: false }));
  }
};

export const hydratePlaylistWindow = (playlistId) => async (dispatch, getState) => {
  const state = getState();
  // Guards against duplicate/overlapping hydration passes for the same playlist — e.g. the
  // PlaylistPage mount effect and the PlaylistUsed click handler both firing for the same
  // playlistId, or a user double-clicking before the first pass finishes. Without this, two
  // full passes race and every unhydrated song gets requested from the YouTube API twice.
  if (state.player.isHydrating[playlistId]) return;

  const songs = state.playlistSongsById[playlistId];
  const { currentIndex } = state.playlistDetails.find((p) => p.playlistId === playlistId);

  const windowStart = Math.max(0, currentIndex - 24);
  const windowEnd = Math.min(songs.length, currentIndex + 25 + 1); // +1 because slice's end is exclusive
  const windowSongs = songs.slice(windowStart, windowEnd);
  const alreadyHydrated = windowSongs.every((s) => s.snippet.title !== null);
  if (alreadyHydrated) return; // nothing to do — e.g. a freshly-added playlist is hydrated already

  // Set synchronously (before the first `await`) so a second call made in the same tick —
  // before this pass has dispatched anything — still sees the flag and bails out above.
  dispatch(setPlaylistHydrating({ playlistId, isHydrating: true }));

  try {
    const videoIds = windowSongs.map((s) => s.snippet.resourceId.videoId);
    const metadataByVideoId = await hydrateSongMetadata(videoIds);

    const updatedSongs = songs.map((song, index) => {
      if (index < windowStart || index >= windowEnd) return song; // outside the window, leave untouched
      const metadata = metadataByVideoId[song.snippet.resourceId.videoId];
      if (metadata) return { ...song, snippet: { ...song.snippet, ...metadata } };
      // video was deleted/private — mark it as such instead of leaving title null forever,
      // which would otherwise show as a permanently-stuck "Loading…" in the UI.
      return {
        ...song,
        snippet: {
          ...song.snippet,
          title: UNAVAILABLE_VIDEO_TITLE,
          videoOwnerChannelTitle: '',
        },
      };
    });

    dispatch(addSongsByPlaylistID({ id: playlistId, songs: updatedSongs })); // reuses the existing action
  } catch (err) {
    // The window fetch failed — reset the flag ourselves since hydrateRemainingSongs (which
    // would otherwise own turning it back off) never gets dispatched in this case.
    dispatch(setPlaylistHydrating({ playlistId, isHydrating: false }));
    throw err;
  }

  dispatch(hydrateRemainingSongs(playlistId)); // kick off background hydration for the rest; owns flipping the flag back off
};
