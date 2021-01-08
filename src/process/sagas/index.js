import { all, takeLatest, spawn } from 'redux-saga/effects';

// TYPES
import { Types as UserTypes } from 'Reducers/user';
import { Types as DeviceTypes } from 'Reducers/device';
import { Types as DeliveryTypes } from 'Reducers/delivery';
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
  refreshDriverData,
  rehydrated,
  sendCrashLog
} from './application';

import {
  acknowledgeClaim,
  driverReply,
  driverReplySuccess,
  foregroundDeliveryActions,
  getCustomerClaims,
  getForDriver,
  getForDriverSuccess,
  getProductsOrder,
  getVehicleStockForDriverSuccess,
  optimizeStops,
  setDelivered,
  setDeliveredOrRejectedSuccess,
  setItemOutOfStock,
  setProductsOrder,
  setRejected,
  startDelivering,
  updateProps as updateDeliveryProps,
  updatedSelectedStop,
  updateReturnPosition
} from './delivery';

import { requestLocationPermissionAndWatch, setLocation } from './device';

import { getDriver } from './user';

export default function* root() {
  yield all([
    spawn(watchLocationChannel),
    takeLatest('APP_STATE.FOREGROUND', foregroundDeliveryActions),

    takeLatest(ApplicationTypes.DISMISS_KEYBOARD, dismissKeyboard),
    takeLatest(ApplicationTypes.INIT, init),
    takeLatest(ApplicationTypes.LOGIN_ERROR, login_error),
    takeLatest(ApplicationTypes.LOGIN_SUCCESS, login_success),
    takeLatest(ApplicationTypes.LOGIN, login),
    takeLatest(ApplicationTypes.LOGOUT, logout),
    takeLatest(ApplicationTypes.MOUNTED, mounted),
    takeLatest(ApplicationTypes.NAVIGATE_BACK, onNavigateBack),
    takeLatest(ApplicationTypes.NAVIGATE, onNavigate),
    takeLatest(ApplicationTypes.REHYDRATED, rehydrated),
    takeLatest(ApplicationTypes.SEND_CRASH_LOG, sendCrashLog),

    takeLatest(DeliveryTypes.ACKNOWLEDGE_CLAIM, acknowledgeClaim),
    takeLatest(DeliveryTypes.DRIVER_REPLY, driverReply),
    takeLatest(DeliveryTypes.DRIVER_REPLY_SUCCESS, driverReplySuccess),
    takeLatest(DeliveryTypes.GET_CUSTOMER_CLAIMS, getCustomerClaims),
    takeLatest(DeliveryTypes.GET_FOR_DRIVER, getForDriver),
    takeLatest(DeliveryTypes.GET_FOR_DRIVER_SUCCESS, getForDriverSuccess),
    takeLatest(
      DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS,
      getVehicleStockForDriverSuccess
    ),
    takeLatest(DeliveryTypes.GET_PRODUCTS_ORDER, getProductsOrder),
    takeLatest(DeliveryTypes.OPTIMIZE_STOPS, optimizeStops),
    takeLatest(DeliveryTypes.REFRESH_DRIVER_DATA, refreshDriverData),
    takeLatest(DeliveryTypes.SET_DELIVERED, setDelivered),
    takeLatest(
      DeliveryTypes.SET_DELIVERED_OR_REJECTED_SUCCESS,
      setDeliveredOrRejectedSuccess
    ),
    takeLatest(DeliveryTypes.SET_ITEM_OUT_OF_STOCK, setItemOutOfStock),
    takeLatest(DeliveryTypes.SET_PRODUCTS_ORDER, setProductsOrder),
    takeLatest(DeliveryTypes.SET_REJECTED, setRejected),
    takeLatest(DeliveryTypes.START_DELIVERING, startDelivering),
    takeLatest(DeliveryTypes.UPDATE_PROPS, updateDeliveryProps),
    takeLatest(DeliveryTypes.UPDATE_RETURN_POSITION, updateReturnPosition),
    takeLatest(DeliveryTypes.UPDATE_SELECTED_STOP, updatedSelectedStop),

    takeLatest(UserTypes.GET_DRIVER, getDriver),

    takeLatest(
      DeviceTypes.REQUEST_USER_LOCATION_PERMISIONS,
      requestLocationPermissionAndWatch
    ),

    takeLatest(REDUX_SAGA_LOCATION_ACTION_SET_POSITION, setLocation)
  ]);
}
