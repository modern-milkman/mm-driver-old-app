import { all, takeLatest, spawn } from 'redux-saga/effects';

// TYPES
import { Types as DeviceTypes } from '/process/reducers/device';
import { Types as ApplicationTypes } from '/process/reducers/application';

import { watchLocationChannel } from 'redux-saga-location';
import { REDUX_SAGA_LOCATION_ACTION_SET_POSITION } from 'redux-saga-location/actions';

// SAGAS
import {
  checkNavigationSideEffects,
  dismissKeyboard,
  init,
  login,
  login_error,
  login_success,
  logout,
  onNavigate,
  onNavigateBack,
  rehydrated
} from './application';

import { requestLocationPermissionAndWatch, setLocation } from './device';

export default function* root() {
  yield all([
    spawn(watchLocationChannel),

    takeLatest('APP_STATE.FOREGROUND', checkNavigationSideEffects),

    takeLatest(ApplicationTypes.DISMISS_KEYBOARD, dismissKeyboard),
    takeLatest(ApplicationTypes.INIT, init),
    takeLatest(ApplicationTypes.LOGIN, login),
    takeLatest(ApplicationTypes.LOGIN_ERROR, login_error),
    takeLatest(ApplicationTypes.LOGIN_SUCCESS, login_success),
    takeLatest(ApplicationTypes.LOGOUT, logout),
    takeLatest(ApplicationTypes.NAVIGATE, onNavigate),
    takeLatest(ApplicationTypes.NAVIGATE_BACK, onNavigateBack),
    takeLatest(ApplicationTypes.REHYDRATED, rehydrated),

    takeLatest(
      DeviceTypes.REQUEST_USER_LOCATION_PERMISIONS,
      requestLocationPermissionAndWatch
    ),

    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_POSITION, setLocation)
  ]);
}
