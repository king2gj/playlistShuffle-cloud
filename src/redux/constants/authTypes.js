export const AUTH_LOG_IN = 'auth/logIn';

export const AUTH_LOG_OUT = 'auth/logOut';

// Distinguishes "haven't fetched this user's playlists from the server yet" from "fetched,
// and this playlist genuinely doesn't exist" — see PlaylistPage.jsx's use of this flag.
export const AUTH_PLAYLISTS_LOADED = 'auth/playlistsLoaded';
