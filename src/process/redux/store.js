import Config from 'react-native-config';
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
import connectionMiddleware from './connectionMiddleware';

let rehydrationComplete;
const middlewares = [];

const rehydrationPromise = new Promise((resolve) => {
  rehydrationComplete = resolve;
});

const rehydration = () => rehydrationPromise;

const sagaMiddleware = createSagaMiddleware();

middlewares.push(createReactNavigationReduxMiddleware((state) => state.nav));
middlewares.push(apiMiddleware);
middlewares.push(connectionMiddleware);
middlewares.push(sagaMiddleware);

if (Config.ENVIRONMENT === 'development') {
  middlewares.push(
    createLogger({
      collapsed: true,
      predicate: () =>
        global.location && global.location.pathname.includes('/debugger-ui')
    })
  );
}

const enhancer = compose(appStateMiddleware(), applyMiddleware(...middlewares));

const persistedReducer = persistReducer(storeConfig, rootReducer);
const store = createStore(persistedReducer, enhancer);
const persistor = persistStore(store, {}, () => {
  rehydrationComplete();
  store.dispatch(StartupActions.rehydrated());
});

sagaMiddleware.run(sagas);

export default () => ({ store, persistor, rehydration });
