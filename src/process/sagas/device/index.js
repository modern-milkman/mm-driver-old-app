// DEVICE SAGAS BELOW
// could be used for offline / online / set position

import * as SplashScreen from 'expo-splash-screen';
import { delay, put, select } from 'redux-saga/effects';
import { InteractionManager, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  requestMultiple,
  PERMISSIONS,
  RESULTS
} from 'react-native-permissions';

import Api from 'Api';
import store from 'Redux/store';
import I18n from 'Locales/I18n';
import NavigationService from 'Services/navigation';
import { user as userSelector } from 'Reducers/user';
import { Types as GrowlTypes } from 'Reducers/growl';
import Analytics, { EVENTS } from 'Services/analytics';
import { deliveryStates as DS, distance } from 'Helpers';
import {
  lastRoute as lastRouteSelector,
  userSessionPresent as userSessionPresentSelector
} from 'Reducers/application';
import {
  Types as DeviceTypes,
  Creators as DeviceCreators,
  autoOpenStopDetails as autoOpenStopDetailsSelector,
  biometrics as biometricsSelector,
  network as networkSelector,
  requestQueues as requestQueuesSelector
} from 'Reducers/device';
import {
  completedStopsIds as completedStopsIdsSelector,
  failedItems as failedItemsSelector,
  itemCount as itemCountSelector,
  routeDescription as routeDescriptionSelector,
  status as statusSelector,
  selectedStop as selectedStopSelector,
  selectedStopId as selectedStopIdSelector,
  stopCount as stopCountSelector
} from 'Reducers/delivery';

export { watchUserLocation } from './extras/watchUserLocation';

export function* ensureMandatoryPermissions({ routeName }) {
  const { dispatch } = store().store;
  const mandatoryPermissions = Platform.select({
    android: [
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.CAMERA
    ],
    ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, PERMISSIONS.IOS.CAMERA]
  });

  const biometrics = yield select(biometricsSelector);
  //https://docs.expo.io/versions/latest/sdk/local-authentication/
  const enrolled = yield LocalAuthentication.isEnrolledAsync();
  const supportedBiometrics =
    yield LocalAuthentication.supportedAuthenticationTypesAsync();
  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: {
      biometrics: {
        supported: supportedBiometrics.length > 0,
        enrolled,
        active: biometrics.active
      }
    }
  });

  requestMultiple(mandatoryPermissions)
    .then(statuses => {
      dispatch(DeviceCreators.updateProps({ permissions: statuses }));
      const statusesArray = Object.values(statuses);
      if (
        statusesArray.includes(RESULTS.DENIED) ||
        statusesArray.includes(RESULTS.BLOCKED) ||
        statusesArray.includes(RESULTS.LIMITED)
      ) {
        NavigationService.navigate({ routeName: 'PermissionsMissing' });
      } else {
        if (routeName) {
          NavigationService.navigate({ routeName });
        }
        dispatch(DeviceCreators.watchUserLocation());
      }
      InteractionManager.runAfterInteractions(async () => {
        await SplashScreen.hideAsync();
      });
    })
    .catch(() => {
      InteractionManager.runAfterInteractions(async () => {
        await SplashScreen.hideAsync();
      });
    });
}

export function* locationError({ error }) {
  Analytics.trackEvent(EVENTS.GEOLOCATION_ERROR, {
    error
  });
}

export function* lowConnectionUpdate({ lowConnection }) {
  yield delay(5000);
  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: { lowConnection: lowConnection }
  });
}

export function* reduxSagaNetstatChange({ netStatProps }) {
  yield delay(1000);
  const { isConnected } = yield select(networkSelector);
  if (isConnected !== netStatProps.isConnected) {
    yield put({
      type: DeviceTypes.UPDATE_NETWORK_PROPS,
      props: { ...netStatProps, status: netStatProps.isConnected ? 0 : 2 }
    });
  }
}

export function* setCountry() {
  Api.configureCountryBaseURL();
}

export function* setLanguage({ language }) {
  I18n.changeLanguage(language);
}

export function* setLocation({ position }) {
  const autoOpenStopDetails = yield select(autoOpenStopDetailsSelector);
  const lastRoute = yield select(lastRouteSelector);
  const status = yield select(statusSelector);
  const selectedStop = yield select(selectedStopSelector);
  const selectedStopId = yield select(selectedStopIdSelector);
  const user = yield select(userSelector);
  const user_session = yield select(userSessionPresentSelector);
  const blackListAutoOpenDeliveryScreens = [
    'Deliver',
    'CustomerIssueDetails',
    'CustomerIssueList',
    'CustomerIssueModal'
  ];

  if (position?.coords?.latitude !== 0 || position?.coords?.longitude !== 0) {
    yield put({ type: DeviceTypes.SET_LOCATION, position: position.coords });

    if (
      user_session &&
      autoOpenStopDetails &&
      selectedStop &&
      status === DS.DEL &&
      ((selectedStop.autoSelectTimestamp &&
        Date.now() - selectedStop.autoSelectTimestamp > 5 * 60 * 1000) ||
        !selectedStop.autoSelectTimestamp) &&
      !blackListAutoOpenDeliveryScreens.includes(lastRoute) &&
      distance(
        {
          x: position.coords.latitude,
          y: position.coords.longitude
        },
        {
          x: selectedStop.latitude,
          y: selectedStop.longitude
        },
        'ME'
      ) < 50
    ) {
      NavigationService.navigate({
        routeName: 'Deliver',
        params: { auto: true, selectedStopId }
      });
    }

    if (user_session && user.driverId) {
      Analytics.trackEvent(EVENTS.SET_DEVICE_LOCATION, position);
      yield put({
        type: Api.API_CALL,
        promise: Api.repositories.fleet.drivers({
          id: `${user.driverId}`,
          location: position.coords
        })
      });
    }
  }
}

export function* setMapMode({ mode }) {
  if (mode === 'manual') {
    yield delay(5000);
    yield put({
      type: DeviceTypes.SET_MAP_MODE,
      mode: 'auto'
    });
  }
}

export function* shareOfflineData() {
  const completedStopsIds = yield select(completedStopsIdsSelector);
  const failedItems = yield select(failedItemsSelector);
  const itemCount = yield select(itemCountSelector);
  const requestQueues = yield select(requestQueuesSelector);
  const routeId = yield select(routeDescriptionSelector);
  const stopCount = yield select(stopCountSelector);
  const user = yield select(userSelector);

  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeviceTypes.SHARE_OFFLINE_DATA_SUCCESS },
      fail: { type: DeviceTypes.SHARE_OFFLINE_DATA_ERROR }
    },
    promise: Api.repositories.slack.sendRouteReport({
      completedStops: completedStopsIds.length,
      failedItems,
      itemCount,
      user,
      routeId,
      requestQueues,
      stopCount
    })
  });
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'info',
      title: I18n.t('alert:success.shareOfflineData.start.title'),
      message: I18n.t('alert:success.shareOfflineData.start.message')
    }
  });
  Analytics.trackEvent(EVENTS.SHARE_OFFLINE_DATA);
}

export function* shareOfflineDataError() {
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'error',
      title: I18n.t('alert:errors.shareOfflineData.failed.title'),
      message: I18n.t('alert:errors.shareOfflineData.failed.message'),
      interval: -1,
      payload: {
        action: DeviceTypes.SHARE_OFFLINE_DATA
      }
    }
  });
  Analytics.trackEvent(EVENTS.SHARE_OFFLINE_DATA_ERROR);
}

export function* shareOfflineDataSuccess() {
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'info',
      title: I18n.t('alert:success.shareOfflineData.completed.title'),
      message: I18n.t('alert:success.shareOfflineData.completed.message')
    }
  });
  Analytics.trackEvent(EVENTS.SHARE_OFFLINE_DATA_SUCCESS);
}

export function* syncOffline({ status }) {
  const { offline, syncHasErrors } = yield select(requestQueuesSelector);
  if (offline.length > 0 && status !== 'TIMEOUT') {
    const { body, config, method, path } = offline[0];
    const params =
      method === 'delete'
        ? [{ ...config, queued: true }]
        : [body, { ...config, queued: true }];

    // TODO should it take into account driverId on BE?
    yield put({
      type: Api.API_CALL,
      promise: Api[method](path, ...params),
      actions: {
        success: {
          type: DeviceTypes.SYNC_OFFLINE,
          lastRequest: 'synced'
        },
        fail: {
          type: DeviceTypes.SYNC_OFFLINE,
          lastRequest: 'failure'
        }
      }
    });
  } else if (status === 'TIMEOUT') {
    yield put({
      type: DeviceTypes.UPDATE_PROCESSOR,
      processor: 'syncData',
      value: false
    });
    yield put({
      type: GrowlTypes.ALERT,
      props: {
        type: 'error',
        title: I18n.t('alert:errors.syncOffline.failed.title'),
        message: I18n.t('alert:errors.syncOffline.failed.message'),
        interval: -1,
        payload: {
          action: DeviceTypes.SYNC_OFFLINE
        }
      }
    });
  } else if (offline.length === 0) {
    if (syncHasErrors) {
      yield put({
        type: GrowlTypes.ALERT,
        props: {
          type: 'error',
          title: I18n.t('alert:errors.syncOffline.failed.title'),
          message: I18n.t('alert:errors.syncOffline.failed.message'),
          interval: -1,
          payload: {
            action: DeviceTypes.SHARE_OFFLINE_DATA
          }
        }
      });
    } else {
      yield put({
        type: GrowlTypes.ALERT,
        props: {
          type: 'info',
          title: I18n.t('alert:success.syncOffline.completed.title'),
          message: I18n.t('alert:success.syncOffline.completed.message')
        }
      });
    }
    yield put({
      type: DeviceTypes.UPDATE_PROCESSOR,
      processor: 'syncData',
      value: false
    });
  }
}

export function* updateDeviceProps({ props }) {
  const { status } = yield select(networkSelector);
  if (
    status !== 0 &&
    (props.computeDirections || props.computeShortDirections)
  ) {
    yield put({
      type: GrowlTypes.ALERT,
      props: {
        type: 'info',
        title: I18n.t('alert:success.settings.offline.directions.title'),
        message: I18n.t('alert:success.settings.offline.directions.message')
      }
    });
  }
}
