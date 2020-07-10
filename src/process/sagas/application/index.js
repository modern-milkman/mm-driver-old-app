import { Keyboard } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { call, put, select } from 'redux-saga/effects';

import Api from 'Api';
import NavigationService from 'Navigation/service';
import Analytics, { EVENTS } from 'Services/analytics';
import {
  Types as TransientTypes,
  transient as transientSelector
} from 'Reducers/transient';
import { Types as UserTypes } from 'Reducers/user';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from 'Reducers/device';
import {
  Types as ApplicationTypes,
  lastRoute as lastRouteSelector,
  lastRouteParams as lastRouteParamsSelector
} from 'Reducers/application';

import { onNavigateSideEffects } from './onNavigateSideEffects';

const defaultRoutes = {
  public: 'Home',
  session: 'Main'
};

// EXPORTED
export const checkNavigationSideEffects = function* () {
  const lastRoute = yield select(lastRouteSelector);
  const lastRouteParams = yield select(lastRouteParamsSelector);
  if (lastRoute) {
    yield call(onNavigateSideEffects, {
      routeName: lastRoute,
      params: lastRouteParams
    });
  }
};

export const dismissKeyboard = function () {
  Keyboard.dismiss();
};

export const init = function* () {
  yield put({ type: DeviceTypes.REQUEST_USER_LOCATION_PERMISIONS });
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
  yield put({ type: UserTypes.UPDATE_PROPS, props: { ...payload } });
  NavigationService.navigate({ routeName: defaultRoutes.session });
};

export const logout = function* () {
  yield put({ type: 'state/RESET' });
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

export const rehydrated = function* () {
  const device = yield select(deviceSelector);
  if (device.uniqueID === 'uninitialized') {
    yield put({
      type: DeviceTypes.UPDATE_PROPS,
      props: {
        uniqueID: DeviceInfo.getUniqueId()
      }
    });
  }
  NavigationService.navigate({ routeName: defaultRoutes.public });
};
