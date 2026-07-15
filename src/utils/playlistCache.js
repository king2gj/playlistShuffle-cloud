const cacheKey = (userId, playlistId) => `playlistCache:${userId}:${playlistId}`;

export function readPlaylistCache(userId, playlistId) {
  const raw = localStorage.getItem(cacheKey(userId, playlistId));
  if (!raw) return null;
  try {
    return JSON.parse(raw); // { shuffledVideoIds: [...], songs: [...] }
  } catch (err) {
    return null; // corrupted/old cache entry — treat as a cache miss
  }
}

export function writePlaylistCache(userId, playlistId, shuffledVideoIds, songs) {
  localStorage.setItem(
    cacheKey(userId, playlistId),
    JSON.stringify({ shuffledVideoIds, songs }),
  );
}

export function clearPlaylistCache(userId, playlistId) {
  localStorage.removeItem(cacheKey(userId, playlistId));
}
