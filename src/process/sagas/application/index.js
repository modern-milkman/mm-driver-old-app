import Appcenter from 'appcenter';
import { Base64 } from 'js-base64';
import RNFS from 'react-native-fs';
import Crashes from 'appcenter-crashes';
import Config from 'react-native-config';
import RNRestart from 'react-native-restart';
import DeviceInfo from 'react-native-device-info';
import { call, delay, put, select } from 'redux-saga/effects';
import { changeIcon, getIcon } from 'react-native-change-icon';
import * as LocalAuthentication from 'expo-local-authentication';
import { InteractionManager, Keyboard, Platform } from 'react-native';

import Api from 'Api';
import store from 'Redux/store';
import I18n from 'Locales/I18n';
import * as SplashScreen from 'expo-splash-screen';
import NavigationService from 'Services/navigation';
import Analytics, { EVENTS } from 'Services/analytics';
import EncryptedStorage from 'Services/encryptedStorage';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { defaultRoutes, isAppInstalled, systemLanguage } from 'Helpers';
import { user as userSelector, Types as UserTypes } from 'Reducers/user';

import {
  Types as TransientTypes,
  transient as transientSelector
} from 'Reducers/transient';
import {
  Types as DeviceTypes,
  biometrics as biometricsSelector,
  country as countrySelector,
  device as deviceSelector,
  processors as processorsSelector
} from 'Reducers/device';
import {
  lastRoute as lastRouteSelector,
  lastRouteParams as lastRouteParamsSelector,
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
export const biometricDisable = function* () {
  const biometrics = yield select(biometricsSelector);
  EncryptedStorage.remove('userCredentials');
  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: {
      rememberMe: false,
      biometrics: {
        ...biometrics,
        active: false
      }
    }
  });
};

export const biometricLogin = function* () {
  const biometricAuth = yield LocalAuthentication.authenticateAsync();
  if (biometricAuth.success) {
    const biometrics = yield select(biometricsSelector);
    yield put({
      type: DeviceTypes.UPDATE_PROPS,
      props: {
        rememberMe: true,
        biometrics: {
          ...biometrics,
          active: true
        }
      }
    });
    yield call(login, true);
  } else {
    yield put({
      type: ApplicationTypes.LOGIN_ERROR,
      status: 'BIOMETRIC_LOGIN_FAILURE',
      data: null
    });
  }
};

export const dismissKeyboard = function () {
  Keyboard.dismiss();
};

export const getTerms = function* () {
  // BE gives us a base64 encoded file, so we need to decode it
  Api.repositories.filesystem
    .downloadFile({
      fromUrl: `${Api.DELIVERY_URL()}/Delivery/TermsAndConditions`,
      toFile: `${RNFS.DocumentDirectoryPath}/${Config.FS_MISC}/terms-and-conditions-base64.pdf`
    })
    .then(getTermsReadBase64);
};

const getTermsReadBase64 = () => {
  Api.repositories.filesystem
    .readFile(
      `${RNFS.DocumentDirectoryPath}/${Config.FS_MISC}/terms-and-conditions-base64.pdf`,
      'base64'
    )
    .then(getTermsWriteDecodedBase64);
};

const getTermsWriteDecodedBase64 = data => {
  Api.repositories.filesystem.writeFile(
    `${RNFS.DocumentDirectoryPath}/${Config.FS_MISC}/terms-and-conditions.pdf`,
    Base64.atob(data),
    'base64'
  );
};

export const init = function* () {
  const availableNavApps = [];

  for (const appName of navigationAppList) {
    if (yield isAppInstalled(appName)) {
      availableNavApps.push(appName);
    }
  }

  //XMAS icon auto change from 1st of Deccember to 1st of January
  getIcon().then(icon => {
    const today = new Date();

    if (parseInt(today.getMonth()) !== 11) {
      if (icon === 'xmas') {
        changeIcon('regular');
      }
    } else {
      if (['default', 'Default'].includes(icon) || icon === 'regular') {
        changeIcon('xmas');
      }
    }
  });

  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: {
      availableNavApps
    }
  });

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

export const login = function* ({ isBiometricLogin = false }) {
  yield put({ type: ApplicationTypes.DISMISS_KEYBOARD });

  const { rememberMe } = yield select(deviceSelector);
  const { email, password } = yield select(transientSelector);
  if (rememberMe) {
    EncryptedStorage.set('userCredentials', { email, password });
  }

  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: ApplicationTypes.LOGIN_SUCCESS },
      fail: { type: ApplicationTypes.LOGIN_ERROR }
    },
    promise: Api.repositories.user.login(email, password),
    isBiometricLogin
  });
  Analytics.trackEvent(EVENTS.TAP_LOGIN);
};

export const login_completed = function* () {
  yield put({ type: DeliveryTypes.REFRESH_ALL_DATA });
  NavigationService.navigate({ routeName: defaultRoutes.session });
  Analytics.trackEvent(EVENTS.LOGIN_COMPLETED);
};

export const login_error = function* ({ status, isBiometricLogin }) {
  yield put({
    type: TransientTypes.UPDATE_PROPS,
    props: {
      ...(status !== 'BIOMETRIC_LOGIN_FAILURE' && { password: '' }),
      jiggleForm: true
    }
  });
  const biometrics = yield select(biometricsSelector);
  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: {
      biometrics: {
        ...biometrics,
        ...(isBiometricLogin && { active: false })
      }
    }
  });
  Analytics.trackEvent(EVENTS.LOGIN_ERROR, { status });
};

export const login_success = function* ({ payload, isBiometricLogin }) {
  yield call(Api.setToken, payload.jwtToken, payload.refreshToken);
  yield put({ type: UserTypes.UPDATE_PROPS, props: { ...payload } });

  yield put({ type: UserTypes.GET_DRIVER, isBiometricLogin });
  yield put({ type: ApplicationTypes.GET_TERMS });
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

export const mounted = function* () {
  yield call(rehydratedAndMounted);
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
  const deviceMounted = yield select(mountedSelector);

  if (deviceMounted) {
    yield call(rehydratedAndMounted);
  }

  if (device.uniqueID === 'uninitialized') {
    const deviceUniqueId = yield call(DeviceInfo.getUniqueId);
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

  if (device.language === 'uninitialized') {
    yield put({
      type: DeviceTypes.SET_LANGUAGE,
      language: systemLanguage()
    });
  } else {
    I18n.changeLanguage(device.language);
  }
};

export const rehydratedAndMounted = function* () {
  const user = yield select(userSelector);
  const country = yield select(countrySelector);
  const lastRoute = yield select(lastRouteSelector);
  const { reloadingDevice } = yield select(processorsSelector);
  const user_session = yield select(userSessionPresentSelector);
  const lastRouteParams = yield select(lastRouteParamsSelector);

  Api.configureCountryBaseURL();

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
    Appcenter.setUserId(`${user.driverId}-${country}`);
    if (new Date(user.refreshExpiry) < new Date()) {
      yield call(verifyAutomatedLoginOrLogout);
    } else {
      yield call(Api.setToken, user.jwtToken, user.refreshToken);
      yield put({
        type: DeviceTypes.ENSURE_MANDATORY_PERMISSIONS,
        routeName: lastRoute,
        params: lastRouteParams
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
    }
  }

  yield put({ type: DeliveryTypes.FOREGROUND_DELIVERY_ACTIONS });
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
    promise: Api.repositories.slack.sendCrashLog(payload)
  });
  Analytics.trackEvent(EVENTS.CRASH_CODE, {
    crashCode: payload?.device?.crashCode
  });
};

export const verifyAutomatedLoginOrLogout = function* () {
  const biometrics = yield select(biometricsSelector);
  const { rememberMe } = yield select(deviceSelector);
  if (biometrics.active && rememberMe) {
    const credentials = yield EncryptedStorage.get('userCredentials');
    if (credentials) {
      yield put({
        type: TransientTypes.UPDATE_PROPS,
        props: {
          ...credentials
        }
      });
      InteractionManager.runAfterInteractions(async () => {
        await SplashScreen.hideAsync();
      });
      yield call(biometricLogin);
    } else {
      InteractionManager.runAfterInteractions(async () => {
        await SplashScreen.hideAsync();
      });
    }
  } else {
    Analytics.trackEvent(EVENTS.AUTOMATED_LOG_OUT);
    yield call(logout);
    InteractionManager.runAfterInteractions(async () => {
      await SplashScreen.hideAsync();
    });
  }
};
