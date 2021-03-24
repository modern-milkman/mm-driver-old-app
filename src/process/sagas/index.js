import { all, takeEvery, takeLatest, spawn } from 'redux-saga/effects';

// TYPES
import { Types as UserTypes } from 'Reducers/user';
import { Types as DeviceTypes } from 'Reducers/device';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { Types as GrowlTypes } from 'Reducers/growl';
import { Types as ApplicationTypes } from 'Reducers/application';

import { watchLocationChannel } from 'redux-saga-location';
import { REDUX_SAGA_LOCATION_ACTION_SET_POSITION } from 'redux-saga-location/actions';

// SAGAS
import {
  dismissKeyboard,
  init,
  login_error,
  login_success,
  login,
  logout,
  mounted,
  onNavigate,
  onNavigateBack,
  rehydrated,
  sendCrashLog
} from './application';

import {
  driverReply,
  foregroundDeliveryActions,
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
  updateDirectionsPolyline,
  updateProps as updateDeliveryProps,
  updateReturnPosition,
  updateSelectedStop
} from './delivery';

import {
  lowConnectionUpdate,
  reduxSagaNetstatChange,
  requestLocationPermissionAndWatch,
  setLocation,
  setMapMode,
  shareOfflineData,
  syncOffline,
  updateNetworkProps
} from './device';

import { alert } from './growl';

import { getDriver } from './user';

export default function* root() {
  yield all([
    spawn(watchLocationChannel),

    takeEvery('REDUX_SAGA_NETSTAT_CHANGE', reduxSagaNetstatChange),

    takeLatest('APP_STATE.FOREGROUND', foregroundDeliveryActions),

    takeLatest(ApplicationTypes.DISMISS_KEYBOARD, dismissKeyboard),
    takeLatest(ApplicationTypes.INIT, init),
    takeLatest(ApplicationTypes.LOGIN, login),
    takeLatest(ApplicationTypes.LOGIN_ERROR, login_error),
    takeLatest(ApplicationTypes.LOGIN_SUCCESS, login_success),
    takeLatest(ApplicationTypes.LOGOUT, logout),
    takeLatest(ApplicationTypes.MOUNTED, mounted),
    takeLatest(ApplicationTypes.NAVIGATE_BACK, onNavigateBack),
    takeLatest(ApplicationTypes.NAVIGATE, onNavigate),
    takeLatest(ApplicationTypes.REHYDRATED, rehydrated),
    takeEvery(ApplicationTypes.SEND_CRASH_LOG, sendCrashLog),
    takeEvery(DeliveryTypes.DRIVER_REPLY, driverReply),

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
    takeEvery(DeliveryTypes.GET_DRIVER_REPLY_IMAGE, getDriverReplyImage),
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
    takeEvery(DeliveryTypes.UPDATE_PROPS, updateDeliveryProps),
    takeEvery(DeliveryTypes.UPDATE_RETURN_POSITION, updateReturnPosition),
    takeEvery(DeliveryTypes.UPDATE_SELECTED_STOP, updateSelectedStop),
    takeEvery(
      DeliveryTypes.UPDATE_DIRECTIONS_POLYLINE,
      updateDirectionsPolyline
    ),

    takeLatest(DeviceTypes.LOW_CONNECTION_UPDATE, lowConnectionUpdate),
    takeLatest(
      DeviceTypes.REQUEST_USER_LOCATION_PERMISIONS,
      requestLocationPermissionAndWatch
    ),
    takeLatest(DeviceTypes.SET_MAP_MODE, setMapMode),
    takeLatest(DeviceTypes.SHARE_OFFLINE_DATA, shareOfflineData),
    takeLatest(DeviceTypes.SYNC_OFFLINE, syncOffline),
    takeLatest(DeviceTypes.UPDATE_NETWORK_PROPS, updateNetworkProps),

    takeEvery(GrowlTypes.ALERT, alert),

    takeEvery(UserTypes.GET_DRIVER, getDriver),

    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_POSITION, setLocation)
  ]);
}
