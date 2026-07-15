import {
  PLAYLIST_DETAILS_ADD_TO_PLAYLIST_DETAILS,
  PLAYLIST_DETAILS_SET,
  PLAYLIST_DETAILS_DELETE_FROM_PLAYLIST_DETAILS,
  PLAYLIST_DETAILS_ETAG,
  PLAYLIST_DETAILS_IMAGE,
  PLAYLIST_DETAILS_LAST_PLAYED_INDEX,
  PLAYLIST_DETAILS_LENGTH,
} from "../constants/playlistDetailsTypes";
import api from "../../utils/api";
import {
  addSongsByPlaylistID,
  hydratePlaylistWindow,
} from "./playlistSongsByIdActions";
import {
  readPlaylistCache,
  writePlaylistCache,
  clearPlaylistCache,
} from "../../utils/playlistCache";

export const setPlaylistDetails = (payload) => ({
  type: PLAYLIST_DETAILS_SET,
  payload,
});

export const modifyEtagInPlaylistDetailsById = (payload) => ({
  type: PLAYLIST_DETAILS_ETAG,
  payload,
});

export const setPlaylistLength = (payload) => ({
  type: PLAYLIST_DETAILS_LENGTH,
  payload,
});

export const setPlaylistImage = (payload) => ({
  type: PLAYLIST_DETAILS_IMAGE,
  payload,
});

export const addToPlaylistDetails = (payload) => (dispatch, getState) => {
  dispatch({ type: PLAYLIST_DETAILS_ADD_TO_PLAYLIST_DETAILS, payload });

  // The caller (Search.jsx / PlaylistUsed.jsx) dispatches `addSongsByPlaylistID` for this
  // same playlist right after this action resolves — deferring to the next tick lets that
  // dispatch land first so `playlistSongsById[playlistId]` below is actually populated,
  // instead of syncing an empty `shuffledVideoIds` array to the server.
  setTimeout(() => {
    const state = getState();
    const songs = state.playlistSongsById[payload.playlistId] || [];
    const shuffledVideoIds = songs.map((song) => song.snippet.resourceId.videoId);

    api
      .post("/playlists", {
        playlistId: payload.playlistId,
        playlistName: payload.playlistName,
        playlistImage: payload.playlistImage,
        playlistEtag: payload.playlistEtag,
        playlistLength: payload.playlistLength,
        shuffledVideoIds,
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.error("Failed to save playlist to server", err));

    if (songs.length) {
      // fetchPlaylistVideos already fetched full metadata for every song here, so there's
      // no need to wait for a later hydration pass before caching it.
      writePlaylistCache(state.auth.userId, payload.playlistId, shuffledVideoIds, songs);
    }
  }, 0);
};

export const deleteFromPlaylistDetails = (playlistId) => (dispatch, getState) => {
  dispatch({
    type: PLAYLIST_DETAILS_DELETE_FROM_PLAYLIST_DETAILS,
    payload: playlistId,
  });

  const { userId } = getState().auth;
  clearPlaylistCache(userId, playlistId);

  api
    .delete(`/playlists/${playlistId}`)
    // eslint-disable-next-line no-console
    .catch((err) => console.error("Failed to delete playlist from server", err));
};

// Called after a client-side re-shuffle (see VideoCard.jsx) so the new song order actually
// reaches the server and local cache — without this, the DB keeps the original import order
// forever and other devices see the un-shuffled playlist.
export const persistShuffledOrder = (playlistId, songs) => (dispatch, getState) => {
  const state = getState();
  const details = state.playlistDetails.find((p) => p.playlistId === playlistId);
  if (!details) return;

  const shuffledVideoIds = songs.map((song) => song.snippet.resourceId.videoId);

  api
    .post("/playlists", {
      playlistId,
      playlistName: details.playlistName,
      playlistImage: details.playlistImage,
      playlistEtag: details.playlistEtag,
      playlistLength: details.playlistLength,
      shuffledVideoIds,
    })
    // eslint-disable-next-line no-console
    .catch((err) => console.error("Failed to save shuffled order to server", err));

  const { userId } = state.auth;
  writePlaylistCache(userId, playlistId, shuffledVideoIds, songs);
};

// Per-playlist debounce timers for the background PATCH below — keyed by playlistId so
// skipping through several songs in one playlist doesn't fire a PATCH per keypress, while
// still tracking each open playlist's own debounce independently.
const patchIndexTimers = new Map();
const PATCH_INDEX_DEBOUNCE_MS = 750;

export const lastPlayedIndexPlaylistDetails = (payload) => (dispatch) => {
  dispatch({ type: PLAYLIST_DETAILS_LAST_PLAYED_INDEX, payload });

  const { playlistId, currentIndex } = payload;
  if (patchIndexTimers.has(playlistId)) {
    clearTimeout(patchIndexTimers.get(playlistId));
  }
  patchIndexTimers.set(
    playlistId,
    setTimeout(() => {
      patchIndexTimers.delete(playlistId);
      api
        .patch(`/playlists/${playlistId}/index`, { currentIndex })
        // eslint-disable-next-line no-console
        .catch((err) => console.error("Failed to save current index to server", err));
    }, PATCH_INDEX_DEBOUNCE_MS),
  );
};

// Replaces what redux-persist rehydration used to do from localStorage: called once on
// app start (see App.jsx) to fill in `playlistDetails` / `playlistSongsById` from the
// database for whichever user is logged in.
export const loadPlaylistsFromServer = () => async (dispatch, getState) => {
  const { data: playlists } = await api.get("/playlists");
  const { userId } = getState().auth;

  dispatch(
    setPlaylistDetails(
      playlists.map((playlist) => ({
        playlistName: playlist.playlist_name,
        playlistId: playlist.playlist_id,
        playlistImage: playlist.playlist_image,
        playlistEtag: playlist.playlist_etag,
        playlistLength: playlist.playlist_length,
        currentIndex: playlist.current_index,
      })),
    ),
  );

  playlists.forEach((playlist) => {
    const dbShuffledVideoIds = playlist.shuffled_video_ids;
    const cache = readPlaylistCache(userId, playlist.playlist_id);
    const cacheIsFresh =
      cache &&
      cache.shuffledVideoIds.length === dbShuffledVideoIds.length &&
      cache.shuffledVideoIds.every((id, index) => id === dbShuffledVideoIds[index]); // order-sensitive

    if (cacheIsFresh) {
      // Cache hit — reuse the cached, already-hydrated song objects. Zero YouTube API calls.
      dispatch(addSongsByPlaylistID({ id: playlist.playlist_id, songs: cache.songs }));
    } else {
      // Cache miss (first time on this browser, or the playlist was re-shuffled/re-added
      // elsewhere) — fall back to the placeholder + windowed hydration flow.
      const placeholderSongs = dbShuffledVideoIds.map((videoId) => ({
        snippet: {
          title: null, // not hydrated yet
          videoOwnerChannelTitle: null,
          resourceId: { videoId },
        },
      }));
      dispatch(addSongsByPlaylistID({ id: playlist.playlist_id, songs: placeholderSongs }));
      dispatch(hydratePlaylistWindow(playlist.playlist_id));
    }
  });
};
