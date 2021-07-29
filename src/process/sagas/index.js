import { all, takeEvery, takeLatest, spawn } from 'redux-saga/effects';

// TYPES
import { Types as UserTypes } from 'Reducers/user';
import { Types as DeviceTypes } from 'Reducers/device';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { Types as GrowlTypes } from 'Reducers/growl';
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
  driverReply,
  foregroundDeliveryActions,
  getBundleProducts,
  getCannedContent,
  getCustomerClaims,
  getDriverDataFailure,
  getDriverReplyImage,
  getForDriver,
  getForDriverSuccess,
  getProductsOrder,
  getRejectDeliveryReasons,
  getVehicleChecks,
  getVehicleStockForDriverSuccess,
  optimizeStops,
  redirectSetSelectedClaimId,
  refreshDriverData,
  saveVehicleChecks,
  setDeliveredOrRejected,
  setItemOutOfStock,
  setProductsOrder,
  setVehicleChecks,
  showMustComplyWithTerms,
  startDelivering,
  updateDriverActivity,
  updateDirectionsPolyline,
  updateProps as updateDeliveryProps,
  updateReturnPosition,
  updateSelectedStop
} from './delivery';

import {
  ensureMandatoryPermissions,
  locationError,
  lowConnectionUpdate,
  reduxSagaNetstatChange,
  setLocation,
  setMapMode,
  shareOfflineData,
  syncOffline,
  updateDeviceProps,
  updateNetworkProps,
  watchUserLocation
} from './device';

import { alert } from './growl';

import { getDriver, setDriver } from './user';

export default function* root() {
  yield all([
    spawn(watchLocationChannel),

    takeLatest('REDUX_SAGA_NETSTAT_CHANGE', reduxSagaNetstatChange),

    takeLatest('APP_STATE.FOREGROUND', foregroundDeliveryActions),

    takeLatest(ApplicationTypes.BIOMETRIC_DISABLE, biometricDisable),
    takeLatest(ApplicationTypes.BIOMETRIC_LOGIN, biometricLogin),
    takeLatest(ApplicationTypes.DISMISS_KEYBOARD, dismissKeyboard),
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
    takeLatest(DeliveryTypes.GET_PRODUCTS_ORDER, getProductsOrder),
    takeLatest(
      DeliveryTypes.GET_REJECT_DELIVERY_REASONS,
      getRejectDeliveryReasons
    ),
    takeLatest(DeliveryTypes.GET_VEHICLE_CHECKS, getVehicleChecks),
    takeLatest(
      DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS,
      getVehicleStockForDriverSuccess
    ),
    takeLatest(DeliveryTypes.OPTIMIZE_STOPS, optimizeStops),
    takeLatest(
      DeliveryTypes.REDIRECT_SET_SELECTED_CLAIM_ID,
      redirectSetSelectedClaimId
    ),
    takeLatest(DeliveryTypes.SET_REJECT_DELIVERY_REASONS, getProductsOrder),
    takeLatest(DeliveryTypes.REFRESH_DRIVER_DATA, refreshDriverData),
    takeLatest(DeliveryTypes.SAVE_VEHICLE_CHECKS, saveVehicleChecks),
    takeLatest(
      DeliveryTypes.SHOW_MUST_COMPLY_WITH_TERMS,
      showMustComplyWithTerms
    ),
    takeEvery(DeliveryTypes.SET_CUSTOMER_CLAIMS, getDriverReplyImage),
    takeEvery(
      DeliveryTypes.SET_DELIVERED,
      setDeliveredOrRejected.bind(null, 'delivered')
    ),
    takeEvery(DeliveryTypes.SET_ITEM_OUT_OF_STOCK, setItemOutOfStock),
    takeEvery(DeliveryTypes.SET_PRODUCTS_ORDER, setProductsOrder),
    takeEvery(
      DeliveryTypes.SET_REJECTED,
      setDeliveredOrRejected.bind(null, 'rejected')
    ),
    takeEvery(DeliveryTypes.SET_VEHICLE_CHECKS, setVehicleChecks),
    takeEvery(DeliveryTypes.START_DELIVERING, startDelivering),
    takeEvery(DeliveryTypes.UPDATE_DRIVER_ACTIVITY, updateDriverActivity),
    takeEvery(DeliveryTypes.UPDATE_PROPS, updateDeliveryProps),
    takeEvery(DeliveryTypes.UPDATE_RETURN_POSITION, updateReturnPosition),
    takeEvery(DeliveryTypes.UPDATE_SELECTED_STOP, updateSelectedStop),
    takeEvery(
      DeliveryTypes.UPDATE_DIRECTIONS_POLYLINE,
      updateDirectionsPolyline
    ),

    takeLatest(
      DeviceTypes.ENSURE_MANDATORY_PERMISSIONS,
      ensureMandatoryPermissions
    ),
    takeLatest(DeviceTypes.LOW_CONNECTION_UPDATE, lowConnectionUpdate),
    takeLatest(DeviceTypes.SET_MAP_MODE, setMapMode),
    takeLatest(DeviceTypes.SHARE_OFFLINE_DATA, shareOfflineData),
    takeLatest(DeviceTypes.SYNC_OFFLINE, syncOffline),
    takeLatest(DeviceTypes.UPDATE_PROPS, updateDeviceProps),
    takeLatest(DeviceTypes.UPDATE_NETWORK_PROPS, updateNetworkProps),
    takeLatest(DeviceTypes.WATCH_USER_LOCATION, watchUserLocation),

    takeEvery(GrowlTypes.ALERT, alert),

    takeEvery(UserTypes.GET_DRIVER, getDriver),
    takeEvery(UserTypes.SET_DRIVER, setDriver),
    takeEvery(UserTypes.SET_DRIVER, login_completed),

    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_ERROR, locationError),
    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_POSITION, setLocation)
  ]);
}
