import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducer';

const composedEnhacer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const store = createStore(rootReducer, undefined, composedEnhacer);

export default store;
