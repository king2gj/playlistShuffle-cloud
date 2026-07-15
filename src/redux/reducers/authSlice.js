import { AUTH_LOG_IN, AUTH_LOG_OUT, AUTH_PLAYLISTS_LOADED } from '../constants/authTypes';

const initialState = {
  token: null,
  username: null,
  userId: null,
  isAuthenticated: false,
  playlistsLoaded: false,
};

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
      return initialState;
    }
    case AUTH_PLAYLISTS_LOADED: {
      return { ...state, playlistsLoaded: action.payload };
    }
    default:
      return state;
  }
}
