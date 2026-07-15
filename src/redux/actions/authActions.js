import { AUTH_LOG_IN, AUTH_LOG_OUT } from '../constants/authTypes';
import api, { decodeJwtPayload } from '../../utils/api';
import { removePlaylistSongsById } from './playlistSongsByIdActions';
import { setPlaylistDetails } from './playlistDetailsActions';

export const logIn = (payload) => ({ type: AUTH_LOG_IN, payload });

export const logOut = () => ({ type: AUTH_LOG_OUT });

const logInFromToken = (dispatch, token, username) => {
  localStorage.setItem('jwt', token);
  const { userId } = decodeJwtPayload(token);
  dispatch(logIn({ token, username, userId }));
};

export const registerUser = (username, password) => async (dispatch) => {
  const { data } = await api.post('/auth/register', { username, password });
  logInFromToken(dispatch, data.token, data.username);
};

export const loginUser = (username, password) => async (dispatch) => {
  const { data } = await api.post('/auth/login', { username, password });
  logInFromToken(dispatch, data.token, data.username);
};

// Restores `isAuthenticated` on a page refresh, since the JWT itself (unlike app data)
// is intentionally still kept in localStorage — see CLOUD_SYNC_PLAN.md §7.
export const restoreSession = () => (dispatch) => {
  const token = localStorage.getItem('jwt');
  if (!token) return;
  try {
    const { userId } = decodeJwtPayload(token);
    dispatch(logIn({ token, username: null, userId }));
  } catch (err) {
    localStorage.removeItem('jwt');
  }
};

export const logoutUser = () => (dispatch, getState) => {
  localStorage.removeItem('jwt');
  // Re-logging in as a different user shouldn't show the previous user's playlists, so
  // clear them here rather than relying on the next login's load thunk to overwrite them.
  Object.keys(getState().playlistSongsById).forEach((playlistId) => {
    dispatch(removePlaylistSongsById(playlistId));
  });
  dispatch(setPlaylistDetails([]));
  dispatch(logOut());
};
