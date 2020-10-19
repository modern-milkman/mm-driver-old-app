import { InteractionManager, Keyboard, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNBootSplash from 'react-native-bootsplash';
import { call, delay, put, select } from 'redux-saga/effects';

import Api from 'Api';
import NavigationService from 'Navigation/service';
import Analytics, { EVENTS } from 'Services/analytics';
import {
  Types as DeliveryTypes,
  deliveryStatus as deliveryStatusSelector
} from 'Reducers/delivery';
import {
  Types as TransientTypes,
  transient as transientSelector
} from 'Reducers/transient';
import { user as userSelector, Types as UserTypes } from 'Reducers/user';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from 'Reducers/device';

import {
  lastRoute as lastRouteSelector,
  Types as ApplicationTypes,
  userSessionPresent as userSessionPresentSelector,
  mounted as mountedSelector
} from 'Reducers/application';
import { defaultRoutes, isAppInstalled } from 'Helpers';
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
  yield put({ type: DeviceTypes.REQUEST_USER_LOCATION_PERMISIONS });

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

  yield put({ type: DeliveryTypes.SET_CURRENT_DAY });
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
};

export const login_error = function* ({ status, data }) {
  yield put({
    type: TransientTypes.UPDATE_PROPS,
    props: { password: '', jiggleForm: true }
  });
};

export const login_success = function* ({ payload }) {
  yield call(Api.setToken, payload.jwtToken, payload.refreshToken);
  yield put({ type: UserTypes.UPDATE_PROPS, props: { ...payload } });
  yield put({ type: UserTypes.GET_DRIVER });
  yield put({ type: DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER });
  yield put({ type: DeliveryTypes.GET_FOR_DRIVER });
  NavigationService.navigate({ routeName: defaultRoutes.session });
};

export const logout = function* () {
  yield put({ type: 'state/RESET' });
  Api.setToken();
  NavigationService.navigate({ routeName: defaultRoutes.public });
};

export const onNavigate = function* (params) {
  yield call(onNavigateSideEffects, params);
  Analytics.trackEvent(EVENTS.NAVIGATE, params);
};

export const onNavigateBack = function* () {
  yield call(onNavigateSideEffects, { routeName: null });
  Analytics.trackEvent(EVENTS.NAVIGATE, { back: true });
};

export const refreshDriverData = function* () {
  const deliveryStatus = yield select(deliveryStatusSelector);

  if (deliveryStatus === 0) {
    yield put({ type: DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER });
    yield put({ type: DeliveryTypes.GET_FOR_DRIVER });
  }
};

export const rehydrated = function* () {
  const device = yield select(deviceSelector);
  const mounted = yield select(mountedSelector);

  if (mounted) {
    yield call(rehydratedAndMounted);
  }

  if (device.uniqueID === 'uninitialized') {
    yield put({
      type: DeviceTypes.UPDATE_PROPS,
      props: {
        uniqueID: DeviceInfo.getUniqueId()
      }
    });
  }
};

export const mounted = function* () {
  yield call(rehydratedAndMounted);
};

export const rehydratedAndMounted = function* () {
  const lastRoute = yield select(lastRouteSelector);
  const user = yield select(userSelector);
  const user_session = yield select(userSessionPresentSelector);
  if (user_session) {
    if (new Date(user.jwtExpiry) < new Date()) {
      yield call(logout);
      RNBootSplash.hide();
    } else {
      yield call(Api.setToken, user.jwtToken, user.refreshToken);
      yield call(refreshDriverData);

      NavigationService.navigate({ routeName: lastRoute });
      yield delay(1000);
      InteractionManager.runAfterInteractions(() => {
        RNBootSplash.hide();
      });
    }
  } else {
    if (lastRoute !== defaultRoutes.public) {
      NavigationService.navigate({ routeName: defaultRoutes.public });
      yield delay(1000);
      InteractionManager.runAfterInteractions(() => {
        RNBootSplash.hide();
      });
    } else {
      RNBootSplash.hide();
    }
  }
};
