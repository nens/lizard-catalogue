import { createStore, applyMiddleware, compose } from 'redux';
import reducer from './reducers';
import ReduxThunk from 'redux-thunk';

const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__ ? (window as any).__REDUX_DEVTOOLS_EXTENSION__() : f => f;

const enhancer = compose(
    applyMiddleware(ReduxThunk),
    devTools
);

const store = createStore(reducer, enhancer);

export default store;