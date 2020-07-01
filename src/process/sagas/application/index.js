import { Keyboard } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { call, put, select } from 'redux-saga/effects';

import NavigationService from '/process/navigation/service';
import Analytics, { EVENTS } from '/process/services/analytics';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from '/process/reducers/device';
import {
  lastRoute as lastRouteSelector,
  lastRouteParams as lastRouteParamsSelector
} from '/process/reducers/application';

import { onNavigateSideEffects } from './onNavigateSideEffects';

const defaultRoutes = {
  public: 'Home',
  session: 'Search'
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
