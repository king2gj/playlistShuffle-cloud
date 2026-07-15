import axios from 'axios';

export default async function hydrateSongMetadata(videoIds) {
  const baseApiUrl = 'https://www.googleapis.com/youtube/v3';
  const apiKey = 'AIzaSyC3zh5q1dqA0pw4Q72k1C8BBQA2KviXaog'; // same key used in fetchPlaylistVideos.js
  const response = await axios.get(`${baseApiUrl}/videos`, {
    params: {
      part: 'snippet',
      id: videoIds.join(','), // videos.list accepts a comma-separated batch of up to 50 IDs
      key: apiKey,
      fields: 'items(id,snippet(title,channelTitle))',
    },
  });
  const metadataByVideoId = {};
  response.data.items.forEach((item) => {
    metadataByVideoId[item.id] = {
      title: item.snippet.title,
      // videos.list calls this field "channelTitle"; playlistItems.list (used elsewhere
      // in this app) calls the equivalent field "videoOwnerChannelTitle" — this rename
      // is the one place that mismatch needs to be handled.
      videoOwnerChannelTitle: item.snippet.channelTitle,
    };
  });
  return metadataByVideoId; // videos that were deleted/private are simply absent from this object
}
