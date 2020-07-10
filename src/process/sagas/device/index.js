// DEVICE SAGAS BELOW
// could be used for offline / online / set position
import { put } from 'redux-saga/effects';

import { Types as DeviceTypes } from 'Reducers/device';

export { requestLocationPermissionAndWatch } from './extras/requestLocationPermissionAndWatch';

export function* setLocation({ position }) {
  yield put({ type: DeviceTypes.SET_LOCATION, position });
}
