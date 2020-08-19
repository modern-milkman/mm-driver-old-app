import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import { createStore, compose, applyMiddleware } from 'redux';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

import sagas from 'Sagas';
import { Creators as StartupActions } from 'Reducers/application';

import { storeConfig } from './config';
import rootReducer from './rootReducer';
import apiMiddleware from './apiMiddleware';
import appStateMiddleware from './appStateMiddleware';

let rehydrationComplete;

const rehydrationPromise = new Promise((resolve) => {
  rehydrationComplete = resolve;
});

const rehydration = () => rehydrationPromise;

const middleware = createReactNavigationReduxMiddleware((state) => state.nav);

const loggerMiddleware = createLogger({
  collapsed: true,
  predicate: () =>
    global.location && global.location.pathname.includes('/debugger-ui')
});

const sagaMiddleware = createSagaMiddleware();

const enhancer = compose(
  appStateMiddleware(),
  applyMiddleware(middleware, apiMiddleware, sagaMiddleware, loggerMiddleware)
);

const persistedReducer = persistReducer(storeConfig, rootReducer);
const store = createStore(persistedReducer, enhancer);
const persistor = persistStore(store, {}, () => {
  rehydrationComplete();
  store.dispatch(StartupActions.rehydrated());
});

sagaMiddleware.run(sagas);

export default () => ({ store, persistor, rehydration });
