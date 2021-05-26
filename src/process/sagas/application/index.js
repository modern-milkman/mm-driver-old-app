import Crashes from 'appcenter-crashes';
import RNRestart from 'react-native-restart';
import DeviceInfo from 'react-native-device-info';
import RNBootSplash from 'react-native-bootsplash';
import { call, delay, put, select } from 'redux-saga/effects';
import { InteractionManager, Keyboard, Platform } from 'react-native';

import Api from 'Api';
import store from 'Redux/store';
import NavigationService from 'Navigation/service';
import Analytics, { EVENTS } from 'Services/analytics';
import { defaultRoutes, isAppInstalled } from 'Helpers';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { user as userSelector, Types as UserTypes } from 'Reducers/user';

import {
  Types as TransientTypes,
  transient as transientSelector
} from 'Reducers/transient';
import {
  Types as DeviceTypes,
  device as deviceSelector,
  processors as processorsSelector
} from 'Reducers/device';
import {
  lastRoute as lastRouteSelector,
  Types as ApplicationTypes,
  userSessionPresent as userSessionPresentSelector,
  mounted as mountedSelector
} from 'Reducers/application';

import { onNavigateSideEffects } from './onNavigateSideEffects';

const navigationAppList = Platform.select({
  android: ['geo', 'waze'],
  ios: ['maps', 'comgooglemaps', 'waze']
});

// EXPORTED
export const dismissKeyboard = function () {
  Keyboard.dismiss();
};

export const init = function* () {
  const availableNavApps = [];
  for (const appName of navigationAppList) {
    if (yield isAppInstalled(appName)) {
      availableNavApps.push(appName);
    }
  }

  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: {
      availableNavApps
    }
  });

  yield put({ type: DeliveryTypes.FOREGROUND_DELIVERY_ACTIONS });
  if (Platform.OS === 'android') {
    yield put({
      type: Api.API_CALL,
      actions: {
        success: { type: DeviceTypes.SET_LATEST_APP }
      },
      promise: Api.repositories.appcenter.getLatest()
    });
  }
  Api.repositories.filesystem.init();
  yield put({ type: ApplicationTypes.RECOVERING_FROM_CRASH });
  Analytics.trackEvent(EVENTS.APP_INIT);
};

export const login = function* () {
  yield put({ type: ApplicationTypes.DISMISS_KEYBOARD });
  const { email, password } = yield select(transientSelector);
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: ApplicationTypes.LOGIN_SUCCESS },
      fail: { type: ApplicationTypes.LOGIN_ERROR }
    },
    promise: Api.repositories.user.login(email, password)
  });
  Analytics.trackEvent(EVENTS.TAP_LOGIN);
};

export const login_error = function* ({ status, data }) {
  yield put({
    type: TransientTypes.UPDATE_PROPS,
    props: { password: '', jiggleForm: true }
  });
  Analytics.trackEvent(EVENTS.LOGIN_ERROR, { status });
};

export const login_success = function* ({ payload }) {
  yield call(Api.setToken, payload.jwtToken, payload.refreshToken);
  yield put({ type: UserTypes.UPDATE_PROPS, props: { ...payload } });
  yield put({ type: UserTypes.GET_DRIVER });
  yield put({ type: DeliveryTypes.GET_REJECT_DELIVERY_REASONS });
  NavigationService.navigate({ routeName: defaultRoutes.session });
  Analytics.trackEvent(EVENTS.LOGIN_SUCCESSFUL);
};

export const logout = function* () {
  Analytics.trackEvent(EVENTS.LOGOUT); // 1st so that it goes into amplitude while we still have the driver data
  NavigationService.navigate({ routeName: defaultRoutes.public });
  InteractionManager.runAfterInteractions(() => {
    const { dispatch } = store().store;
    dispatch({ type: 'state/RESET' });
    Api.repositories.filesystem.clear();
    Api.setToken();
  });
};

export const onNavigate = function* (params) {
  yield call(onNavigateSideEffects, params);
  Analytics.trackEvent(EVENTS.NAVIGATE, { params });
};

export const onNavigateBack = function* () {
  yield call(onNavigateSideEffects, { routeName: null });
  Analytics.trackEvent(EVENTS.NAVIGATE, { back: true });
};

export const recoveringFromCrash = async function () {
  const didCrash = await Crashes.hasCrashedInLastSession();
  if (didCrash) {
    const info = await Crashes.lastSessionCrashReport();
    const { dispatch, getState } = store().store;
    const { device, user } = getState();
    const payload = {
      device,
      user,
      error: 'appcenter crash',
      info
    };
    dispatch({ type: ApplicationTypes.SEND_CRASH_LOG, payload });
  }
};

export const rehydrated = function* () {
  const device = yield select(deviceSelector);
  const mounted = yield select(mountedSelector);

  if (mounted) {
    yield call(rehydratedAndMounted);
  }

  if (device.uniqueID === 'uninitialized') {
    const deviceUniqueId = DeviceInfo.getUniqueId();
    yield put({
      type: DeviceTypes.UPDATE_PROPS,
      props: {
        uniqueID: deviceUniqueId
      }
    });

    Analytics.trackEvent(EVENTS.DEVICE_ID_UNINITIALIZED_GET_UNIQUE, {
      deviceUniqueId
    });
  }
};

export const resetAndReload = function* () {
  yield put({
    type: ApplicationTypes.LOGOUT
  });
  yield put({
    type: DeviceTypes.UPDATE_PROCESSOR,
    processor: 'reloadingDevice',
    value: true
  });
  yield delay(1000);
  RNRestart.Restart();
};

export const sendCrashLog = function* ({ payload }) {
  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.crash.sendCrashLog(payload)
  });
};

export const mounted = function* () {
  yield call(rehydratedAndMounted);
};

export const rehydratedAndMounted = function* () {
  const lastRoute = yield select(lastRouteSelector);
  const user = yield select(userSelector);
  const user_session = yield select(userSessionPresentSelector);
  const { reloadingDevice } = yield select(processorsSelector);

  if (reloadingDevice) {
    yield put({
      type: DeviceTypes.UPDATE_PROPS,
      props: { crashCount: 0 }
    });
    yield put({
      type: DeviceTypes.UPDATE_PROCESSOR,
      processor: 'reloadingDevice',
      value: false
    });
  }

  if (user_session) {
    if (new Date(user.refreshExpiry) < new Date()) {
      yield call(logout);
      RNBootSplash.hide();
    } else {
      yield call(Api.setToken, user.jwtToken, user.refreshToken);
      yield put({
        type: DeviceTypes.ENSURE_MANDATORY_PERMISSIONS,
        routeName: lastRoute
      });
    }
  } else {
    if (lastRoute !== defaultRoutes.public) {
      yield put({
        type: DeviceTypes.ENSURE_MANDATORY_PERMISSIONS,
        routeName: defaultRoutes.public
      });
    } else {
      yield put({ type: DeviceTypes.ENSURE_MANDATORY_PERMISSIONS });
      RNBootSplash.hide();
    }
  }
  DeviceInfo.getTotalMemory().then((totalMemory) => {
    Analytics.trackEvent(EVENTS.TOTAL_MEMORY, {
      totalMemory: Math.floor(totalMemory / (1024 * 1024))
    });
  });
};
