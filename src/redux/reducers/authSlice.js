import { AUTH_LOG_IN, AUTH_LOG_OUT, AUTH_PLAYLISTS_LOADED } from '../constants/authTypes';
import { decodeJwtPayload } from '../../utils/api';

const loggedOutState = {
  token: null,
  username: null,
  userId: null,
  isAuthenticated: false,
  playlistsLoaded: false,
};

// Restoring the session from the stored JWT here (synchronously, at store creation) — rather
// than only via the `restoreSession` thunk dispatched from App.jsx's mount effect — is what
// lets RequireAuth see `isAuthenticated: true` on the very first render. Without this, every
// reload of a protected route briefly rendered with the pre-login initial state and got
// redirected to /login before the mount effect had a chance to run.
function getInitialAuthState() {
  const token = localStorage.getItem('jwt');
  if (!token) return loggedOutState;
  try {
    const { userId } = decodeJwtPayload(token);
    return { token, username: null, userId, isAuthenticated: true, playlistsLoaded: false };
  } catch (err) {
    localStorage.removeItem('jwt');
    return loggedOutState;
  }
}

const initialState = getInitialAuthState();

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case AUTH_LOG_IN: {
      return {
        ...state,
        token: action.payload.token,
        username: action.payload.username,
        userId: action.payload.userId,
        isAuthenticated: true,
      };
    }
    case AUTH_LOG_OUT: {
      return loggedOutState;
    }
    case AUTH_PLAYLISTS_LOADED: {
      return { ...state, playlistsLoaded: action.payload };
    }
    default:
      return state;
  }
}
