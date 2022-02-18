import { createStore, applyMiddleware, compose, AnyAction } from 'redux';
import reducer from './reducers';
import ReduxThunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';

const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__ ? (window as any).__REDUX_DEVTOOLS_EXTENSION__() : (f: Function) => f;

// The typing below is based on https://stackoverflow.com/a/57102280/

export type RootState = ReturnType <typeof reducer>;

type DispatchFunctionType = ThunkDispatch<RootState, undefined, AnyAction>;

const enhancer = compose(
    applyMiddleware<DispatchFunctionType, RootState>(ReduxThunk ),
    devTools
);

const store = createStore(reducer, enhancer);
export const rootDispatch: RootDispatch = store.dispatch;
export type RootDispatch = ThunkDispatch<AppState, undefined, AnyAction>;
export type AppState = ReturnType<typeof store.getState>;
export type AppGetState = () => AppState;
export type Thunk = ThunkAction<void, AppState, undefined, AnyAction>;

export default store;
