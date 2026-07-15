import { AUTH_LOG_IN, AUTH_LOG_OUT } from '../constants/authTypes';

const initialState = {
  token: null,
  username: null,
  userId: null,
  isAuthenticated: false,
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
    default:
      return state;
  }
}
