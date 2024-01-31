import Config from 'react-native-config';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import { createStore, compose, applyMiddleware } from 'redux';

import Api from 'Api';
import sagas from 'Sagas';
import { formatDateTime } from 'Helpers';
import Analytics, { EVENTS } from 'Services/analytics';
import { Creators as DeviceActions } from 'Reducers/device';
import { Creators as StartupActions } from 'Reducers/application';

import { storeConfig } from './config';
import rootReducer from './rootReducer';
import apiMiddleware from './apiMiddleware';
import appStateMiddleware from './appStateMiddleware';

let rehydrationComplete;
const middlewares = [];

const rehydrationPromise = new Promise(resolve => {
  rehydrationComplete = resolve;
});

const rehydration = () => rehydrationPromise;

const handleSagaError = error => {
  if (JSON.parse(Config.SEND_SLACK_CRASHLOGS) && store) {
    const { dispatch, getState } = store;
    const { delivery, device, user } = getState();
    // sagas have crashed and cannot be recovered
    // use repository and analytics directly
    const props = {
      crashCount: 1,
      crashCode: `${device.uniqueID}.${formatDateTime(new Date())}`
    };
    Api.repositories.slack.sendCrashLog({
      delivery,
      device,
      error,
      user
    });
    Analytics.trackEvent(EVENTS.CRASH_CODE, {
      crashCode: props.crashCode
    });
    dispatch(DeviceActions.updateProps(props));
    dispatch(StartupActions.updateProps({ hasMiddlewareError: true }));
  }
};

const sagaMiddleware = createSagaMiddleware({
  onError: handleSagaError
});

middlewares.push(apiMiddleware);
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
