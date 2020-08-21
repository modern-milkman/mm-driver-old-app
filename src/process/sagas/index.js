import { all, takeLatest, spawn } from 'redux-saga/effects';

// TYPES
import { Types as DeviceTypes } from 'Reducers/device';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { Types as ApplicationTypes } from 'Reducers/application';

import { watchLocationChannel } from 'redux-saga-location';
import { REDUX_SAGA_LOCATION_ACTION_SET_POSITION } from 'redux-saga-location/actions';

// SAGAS
import {
  dismissKeyboard,
  init,
  initRefreshToken,
  login_error,
  login_success,
  login,
  logout,
  onNavigate,
  onNavigateBack,
  refreshTokenSuccess,
  rehydrated
} from './application';

import {
  getForDriver,
  getForDriverSuccess,
  startDelivering,
  updateReturnPosition
} from './delivery';

import { requestLocationPermissionAndWatch, setLocation } from './device';

export default function* root() {
  yield all([
    spawn(watchLocationChannel),

    takeLatest('APP_STATE.FOREGROUND', initRefreshToken),

    takeLatest(ApplicationTypes.DISMISS_KEYBOARD, dismissKeyboard),
    takeLatest(ApplicationTypes.INIT, init),
    takeLatest(ApplicationTypes.LOGIN_ERROR, login_error),
    takeLatest(ApplicationTypes.LOGIN_SUCCESS, login_success),
    takeLatest(ApplicationTypes.LOGIN, login),
    takeLatest(ApplicationTypes.LOGOUT, logout),
    takeLatest(ApplicationTypes.NAVIGATE_BACK, onNavigateBack),
    takeLatest(ApplicationTypes.NAVIGATE, onNavigate),
    takeLatest(ApplicationTypes.REFRESH_TOKEN_SUCCESS, refreshTokenSuccess),
    takeLatest(ApplicationTypes.REHYDRATED, rehydrated),

    takeLatest(DeliveryTypes.GET_FOR_DRIVER, getForDriver),
    takeLatest(DeliveryTypes.GET_FOR_DRIVER_SUCCESS, getForDriverSuccess),
    takeLatest(DeliveryTypes.START_DELIVERING, startDelivering),
    takeLatest(DeliveryTypes.UPDATE_RETURN_POSITION, updateReturnPosition),

    takeLatest(
      DeviceTypes.REQUEST_USER_LOCATION_PERMISIONS,
      requestLocationPermissionAndWatch
    ),

    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_POSITION, setLocation)
  ]);
}
