// DEVICE SAGAS BELOW
// could be used for offline / online / set position
import Share from 'react-native-share';
import RNBootSplash from 'react-native-bootsplash';
import { put, delay, select } from 'redux-saga/effects';
import CompassHeading from 'react-native-compass-heading';
import { InteractionManager, Platform } from 'react-native';
import {
  requestMultiple,
  PERMISSIONS,
  RESULTS
} from 'react-native-permissions';

import Api from 'Api';
import store from 'Redux/store';
import I18n from 'Locales/I18n';
import NavigationService from 'Navigation/service';
import { user as userSelector } from 'Reducers/user';
import { Creators as GrowlCreators, Types as GrowlTypes } from 'Reducers/growl';
import { userSessionPresent as userSessionPresentSelector } from 'Reducers/application';

import {
  Types as DeviceTypes,
  Creators as DeviceCreators,
  network as networkSelector,
  processors as processorsSelector,
  requestQueues as requestQueuesSelector
} from 'Reducers/device';

export { watchUserLocation } from './extras/watchUserLocation';

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

export function* setLocation({ position }) {
  const user = yield select(userSelector);
  const user_session = yield select(userSessionPresentSelector);

  if (position?.coords?.speed < 2.5) {
    delete position.coords.heading;
    CompassHeading.start(3, (heading) => {
      const { dispatch } = store().store;
      dispatch(DeviceCreators.setLocationHeading(heading));
    });
  } else {
    CompassHeading.stop();
  }

  yield put({ type: DeviceTypes.SET_LOCATION, position: position.coords });

  if (user_session && user.driverId) {
    yield put({
      type: Api.API_CALL,
      promise: Api.repositories.fleet.drivers({
        id: `${user.driverId}`,
        location: position.coords
      })
    });
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
  const requestQueues = yield select(requestQueuesSelector);
  const { dispatch } = store().store;

  Share.open({
    title: I18n.t('screens:reports.share.title'),
    message: JSON.stringify({
      ...requestQueues
    })
  })
    .then(() => {
      dispatch(DeviceCreators.clearFailedRequests());
      dispatch(
        GrowlCreators.alert({
          type: 'info',
          title: I18n.t('alert:success.reports.sendToSuper.title'),
          message: I18n.t('alert:success.reports.sendToSuper.message'),
          interval: -1
        })
      );
    })
    .catch(() => {
      dispatch(
        GrowlCreators.alert({
          type: 'error',
          title: I18n.t('alert:errors.reports.sendToSuper.title'),
          message: I18n.t('alert:errors.reports.sendToSuper.message'),
          interval: -1
        })
      );
    });
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
        title: I18n.t('alert:errors.reports.retrySync.title'),
        message: I18n.t('alert:errors.reports.retrySync.message'),
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
          title: I18n.t('alert:errors.reports.sync.title'),
          message: I18n.t('alert:errors.reports.sync.message'),
          interval: -1
        }
      });
    } else {
      yield put({
        type: GrowlTypes.ALERT,
        props: {
          type: 'info',
          title: I18n.t('alert:success.reports.sync.title'),
          message: I18n.t('alert:success.reports.sync.message'),
          interval: -1
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

export const ensureMandatoryPermissions = function* ({ routeName }) {
  const { dispatch } = store().store;
  const mandatoryPermissions = Platform.select({
    android: [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
    ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
  });
  requestMultiple(mandatoryPermissions).then((statuses) => {
    dispatch(DeviceCreators.updateProps({ permissions: statuses }));
    const statusesArray = Platform.select({
      android: [statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]],
      ios: [statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]]
    });
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
    InteractionManager.runAfterInteractions(() => {
      RNBootSplash.hide();
    });
  });
};

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

export function* updateNetworkProps() {
  const { status } = yield select(networkSelector);
  const { offline } = yield select(requestQueuesSelector);
  const { syncData } = yield select(processorsSelector);
  const user_session = yield select(userSessionPresentSelector);

  if (user_session && !syncData && status === 0 && offline.length > 0) {
    yield put({
      type: GrowlTypes.ALERT,
      props: {
        type: 'info',
        title: I18n.t('alert:success.network.online.title'),
        message: I18n.t('alert:success.network.online.message')
      }
    });
    yield put({ type: DeviceTypes.SYNC_OFFLINE });
  }
}
