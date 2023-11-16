import { all, takeEvery, takeLatest, spawn } from 'redux-saga/effects';

// TYPES
import { Types as UserTypes } from 'Reducers/user';
import { Types as GrowlTypes } from 'Reducers/growl';
import { Types as DeviceTypes } from 'Reducers/device';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { Types as ApplicationTypes } from 'Reducers/application';

import { watchLocationChannel } from 'redux-saga-location';
import {
  REDUX_SAGA_LOCATION_ACTION_SET_ERROR,
  REDUX_SAGA_LOCATION_ACTION_SET_POSITION
} from 'redux-saga-location/actions';

// SAGAS
import {
  biometricLogin,
  biometricDisable,
  dismissKeyboard,
  getTerms,
  init,
  login_completed,
  login_error,
  login_success,
  login,
  logout,
  mounted,
  onNavigate,
  onNavigateBack,
  recoveringFromCrash,
  rehydrated,
  resetAndReload,
  sendCrashLog,
  verifyAutomatedLoginOrLogout
} from './application';

import {
  continueDelivering,
  deliverLater,
  driverReply,
  foregroundDeliveryActions,
  getBundleProducts,
  getCannedContent,
  getCustomerClaims,
  getDriverDataFailure,
  getDriverReplyImage,
  getForDriver,
  getForDriverSuccess,
  getRegistrationPlates,
  getRejectDeliveryReasons,
  getReturnTypes,
  getVehicleStockForDriverSuccess,
  redirectSetSelectedClaimId,
  refreshAllData,
  saveVehicleChecks,
  scanExternalReference,
  scanExternalReferenceSuccess,
  setDeliveredOrRejected,
  setItemOutOfStock,
  setReturnTypes,
  showMustComplyWithTerms,
  showPODRequired,
  updateDirectionsPolyline,
  updateDriverActivity,
  updateProps as updateDeliveryProps,
  updateSelectedStop
} from './delivery';

import {
  ensureMandatoryPermissions,
  locationError,
  lowConnectionUpdate,
  reduxSagaNetstatChange,
  setCountry,
  setLanguage,
  setLocation,
  setMapMode,
  shareOfflineData,
  shareOfflineDataError,
  shareOfflineDataSuccess,
  syncOffline,
  updateDeviceProps,
  watchUserLocation
} from './device';

import { alert } from './growl';

import {
  acceptTerms,
  acceptTermsError,
  acceptTermsSuccess,
  getDriver,
  setDriver
} from './user';

export default function* root() {
  yield all([
    spawn(watchLocationChannel),

    takeLatest('REDUX_SAGA_NETSTAT_CHANGE', reduxSagaNetstatChange),

    takeLatest('APP_STATE.FOREGROUND', foregroundDeliveryActions),

    takeLatest(ApplicationTypes.BIOMETRIC_DISABLE, biometricDisable),
    takeLatest(ApplicationTypes.BIOMETRIC_LOGIN, biometricLogin),
    takeLatest(ApplicationTypes.DISMISS_KEYBOARD, dismissKeyboard),
    takeLatest(ApplicationTypes.GET_TERMS, getTerms),
    takeLatest(ApplicationTypes.INIT, init),
    takeLatest(ApplicationTypes.LOGIN, login),
    takeLatest(ApplicationTypes.LOGIN_ERROR, login_error),
    takeLatest(ApplicationTypes.LOGIN_SUCCESS, login_success),
    takeLatest(ApplicationTypes.LOGOUT, logout),
    takeLatest(ApplicationTypes.MOUNTED, mounted),
    takeLatest(ApplicationTypes.NAVIGATE_BACK, onNavigateBack),
    takeLatest(ApplicationTypes.NAVIGATE, onNavigate),
    takeLatest(ApplicationTypes.RECOVERING_FROM_CRASH, recoveringFromCrash),
    takeLatest(ApplicationTypes.REHYDRATED, rehydrated),
    takeLatest(ApplicationTypes.RESET_AND_RELOAD, resetAndReload),
    takeEvery(ApplicationTypes.SEND_CRASH_LOG, sendCrashLog),
    takeLatest(
      ApplicationTypes.VERIFY_AUTOMATED_LOGIN_OR_LOGOUT,
      verifyAutomatedLoginOrLogout
    ),

    takeEvery(DeliveryTypes.CONTINUE_DELIVERING, continueDelivering),
    takeEvery(DeliveryTypes.DELIVER_LATER, deliverLater),
    takeEvery(DeliveryTypes.DRIVER_REPLY, driverReply),
    takeEvery(
      DeliveryTypes.FOREGROUND_DELIVERY_ACTIONS,
      foregroundDeliveryActions
    ),
    takeLatest(DeliveryTypes.GET_BUNDLE_PRODUCTS, getBundleProducts),
    takeLatest(DeliveryTypes.GET_CANNED_CONTENT, getCannedContent),
    takeEvery(DeliveryTypes.GET_CUSTOMER_CLAIMS, getCustomerClaims),
    takeLatest(DeliveryTypes.GET_DRIVER_DATA_FAILURE, getDriverDataFailure),
    takeLatest(DeliveryTypes.GET_FOR_DRIVER, getForDriver),
    takeLatest(DeliveryTypes.GET_FOR_DRIVER_SUCCESS, getForDriverSuccess),
    takeLatest(
      DeliveryTypes.GET_REJECT_DELIVERY_REASONS,
      getRejectDeliveryReasons
    ),

    takeLatest(
      DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS,
      getVehicleStockForDriverSuccess
    ),
    takeLatest(
      DeliveryTypes.REDIRECT_SET_SELECTED_CLAIM_ID,
      redirectSetSelectedClaimId
    ),
    takeLatest(DeliveryTypes.REFRESH_ALL_DATA, refreshAllData),
    takeLatest(DeliveryTypes.SAVE_VEHICLE_CHECKS, saveVehicleChecks),
    takeLatest(DeliveryTypes.SCAN_EXTERNAL_REFERENCE, scanExternalReference),
    takeLatest(
      DeliveryTypes.SCAN_EXTERNAL_REFERENCE_SUCCESS,
      scanExternalReferenceSuccess
    ),
    takeEvery(DeliveryTypes.SET_CUSTOMER_CLAIMS, getDriverReplyImage),
    takeLatest(
      DeliveryTypes.SET_DELIVERED,
      setDeliveredOrRejected.bind(null, 'delivered')
    ),
    takeEvery(DeliveryTypes.SET_ITEM_OUT_OF_STOCK, setItemOutOfStock),
    takeLatest(DeliveryTypes.SET_REJECT_DELIVERY_REASONS, getBundleProducts),
    takeLatest(DeliveryTypes.SET_BUNDLE_PRODUCTS, getRegistrationPlates),
    takeLatest(DeliveryTypes.SET_REGISTRATION_PLATES, getReturnTypes),
    takeLatest(
      DeliveryTypes.SET_REJECTED,
      setDeliveredOrRejected.bind(null, 'rejected')
    ),
    takeEvery(DeliveryTypes.SET_RETURN_TYPES, setReturnTypes),
    takeLatest(
      DeliveryTypes.SHOW_MUST_COMPLY_WITH_TERMS,
      showMustComplyWithTerms
    ),
    takeEvery(DeliveryTypes.SHOW_POD_REQUIRED, showPODRequired),
    takeEvery(
      DeliveryTypes.UPDATE_DIRECTIONS_POLYLINE,
      updateDirectionsPolyline
    ),
    takeEvery(DeliveryTypes.UPDATE_DRIVER_ACTIVITY, updateDriverActivity),
    takeEvery(DeliveryTypes.UPDATE_PROPS, updateDeliveryProps),
    takeEvery(DeliveryTypes.UPDATE_SELECTED_STOP, updateSelectedStop),

    takeLatest(
      DeviceTypes.ENSURE_MANDATORY_PERMISSIONS,
      ensureMandatoryPermissions
    ),
    takeLatest(DeviceTypes.LOW_CONNECTION_UPDATE, lowConnectionUpdate),
    takeLatest(DeviceTypes.SET_COUNTRY, setCountry),
    takeLatest(DeviceTypes.SET_LANGUAGE, setLanguage),
    takeLatest(DeviceTypes.SET_MAP_MODE, setMapMode),
    takeLatest(DeviceTypes.SHARE_OFFLINE_DATA, shareOfflineData),
    takeLatest(DeviceTypes.SHARE_OFFLINE_DATA_ERROR, shareOfflineDataError),
    takeLatest(DeviceTypes.SHARE_OFFLINE_DATA_SUCCESS, shareOfflineDataSuccess),
    takeLatest(DeviceTypes.SYNC_OFFLINE, syncOffline),
    takeLatest(DeviceTypes.UPDATE_PROPS, updateDeviceProps),
    takeLatest(DeviceTypes.WATCH_USER_LOCATION, watchUserLocation),

    takeEvery(GrowlTypes.ALERT, alert),

    takeEvery(UserTypes.ACCEPT_TERMS, acceptTerms),
    takeEvery(UserTypes.ACCEPT_TERMS_ERROR, acceptTermsError),
    takeEvery(UserTypes.ACCEPT_TERMS_SUCCESS, acceptTermsSuccess),
    takeEvery(UserTypes.GET_DRIVER, getDriver),
    takeEvery(UserTypes.SET_DRIVER, setDriver),
    takeEvery(UserTypes.SET_DRIVER, login_completed),

    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_ERROR, locationError),
    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_POSITION, setLocation)
  ]);
}
