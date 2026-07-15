import { combineReducers } from 'redux';
import playerReducer from './redux/reducers/playerSlice';
import playlistDetailsReducer from './redux/reducers/playlistDetailsSlice';
import playlistSongsByIdReducer from './redux/reducers/playlistSongsByIdSlice';
import homepageReducer from './redux/reducers/homepageSlice';
import authReducer from './redux/reducers/authSlice';

const rootReducer = combineReducers({
  playlistSongsById: playlistSongsByIdReducer,
  player: playerReducer,
  playlistDetails: playlistDetailsReducer,
  homepage: homepageReducer,
  auth: authReducer,
});

export default rootReducer;
