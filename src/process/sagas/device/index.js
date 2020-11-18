// DEVICE SAGAS BELOW
// could be used for offline / online / set position
import { put, select } from 'redux-saga/effects';

import Api from 'Api';
import { user as userSelector } from 'Reducers/user';
import { Types as DeviceTypes } from 'Reducers/device';
import { userSessionPresent as userSessionPresentSelector } from 'Reducers/application';
export { requestLocationPermissionAndWatch } from './extras/requestLocationPermissionAndWatch';

export function* setLocation({ position }) {
  const user = yield select(userSelector);
  const user_session = yield select(userSessionPresentSelector);

  yield put({ type: DeviceTypes.SET_LOCATION, position });

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
