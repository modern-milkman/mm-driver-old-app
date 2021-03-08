// DEVICE SAGAS BELOW
// could be used for offline / online / set position
import { put, delay, select } from 'redux-saga/effects';
import CompassHeading from 'react-native-compass-heading';

import Api from 'Api';
import store from 'Redux/store';
import { user as userSelector } from 'Reducers/user';
import { userSessionPresent as userSessionPresentSelector } from 'Reducers/application';

import {
  Types as DeviceTypes,
  Creators as DeviceCreators
} from 'Reducers/device';

export { requestLocationPermissionAndWatch } from './extras/requestLocationPermissionAndWatch';

export function* lowConnectionUpdate({ lowConnection }) {
  yield delay(5000);
  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: { lowConnection: lowConnection }
  });
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
