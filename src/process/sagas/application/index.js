import DeviceInfo from 'react-native-device-info';
import RNBootSplash from 'react-native-bootsplash';
import { call, delay, put, select } from 'redux-saga/effects';
import { InteractionManager, Keyboard, Platform } from 'react-native';

import Api from 'Api';
import I18n from 'Locales/I18n';
import NavigationService from 'Navigation/service';
import { Types as GrowlTypes } from 'Reducers/growl';
import Analytics, { EVENTS } from 'Services/analytics';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { user as userSelector, Types as UserTypes } from 'Reducers/user';

import {
  blacklistApiEndpointFailureTracking,
  defaultRoutes,
  isAppInstalled
} from 'Helpers';
import {
  Types as TransientTypes,
  transient as transientSelector
} from 'Reducers/transient';
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

import { onNavigateSideEffects } from './onNavigateSideEffects';

const navigationAppList = Platform.select({
  android: ['geo', 'waze'],
  ios: ['maps', 'comgooglemaps', 'waze']
});

// EXPORTED
export const apiError = function* ({ error, status }) {
  if (
    !blacklistApiEndpointFailureTracking.includes(
      `${error?.config?.baseURL}${error?.config?.url}`
    ) &&
    !blacklistApiEndpointFailureTracking.includes(error?.config?.url)
  ) {
    switch (status) {
      case 400:
      case 500:
      case 'TIMEOUT':
        yield put({
          type: GrowlTypes.ALERT,
          props: {
            type: 'error',
            title: I18n.t('alert:errors.api.backend.title', { status }),
            message: I18n.t('alert:errors.api.backend.message')
          }
        });
        break;
    }
  }
};

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

  yield put({ type: DeliveryTypes.FOREGROUND_DELIVERY_ACTIONS });
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
  yield put({ type: DeliveryTypes.GET_PRODUCTS_ORDER });
  NavigationService.navigate({ routeName: defaultRoutes.session });
  Analytics.trackEvent(EVENTS.LOGIN_SUCCESSFUL);
};

export const logout = function* () {
  yield put({ type: 'state/RESET' });
  Api.setToken();
  NavigationService.navigate({ routeName: defaultRoutes.public });
  Analytics.trackEvent(EVENTS.LOGOUT);
};

export const onNavigate = function* (params) {
  yield call(onNavigateSideEffects, params);
  Analytics.trackEvent(EVENTS.NAVIGATE, { params });
};

export const onNavigateBack = function* () {
  yield call(onNavigateSideEffects, { routeName: null });
  Analytics.trackEvent(EVENTS.NAVIGATE, { back: true });
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
  if (user_session) {
    if (new Date(user.refreshExpiry) < new Date()) {
      yield call(logout);
      RNBootSplash.hide();
    } else {
      yield call(Api.setToken, user.jwtToken, user.refreshToken);

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
