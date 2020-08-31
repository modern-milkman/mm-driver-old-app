import { call, put, select } from 'redux-saga/effects';

import Api from 'Api';
import NavigationService from 'Navigation/service';
import {
  Types as DeliveryTypes,
  selectedStop as selectedStopSelector
} from 'Reducers/delivery';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from 'Reducers/device';

// EXPORTED
export const getForDriver = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_FOR_DRIVER_SUCCESS },
      fail: { type: DeliveryTypes.UPDATE_PROPS }
    },
    promise: Api.repositories.delivery.getForDriver(),
    props: { processing: false }
  });
};

export const getForDriverSuccess = function* ({ payload }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: {
        type: DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS,
        fail: { type: DeliveryTypes.UPDATE_PROPS }
      }
    },
    promise: Api.repositories.delivery.getVehicleStockForDriver(),
    deliveryDate: payload.deliveryDate,
    props: { processing: false }
  });
};

export const optimizeStops = function* () {
  yield call(updatedSelectedStop);
};

export const startDelivering = function* () {
  const device = yield select(deviceSelector);
  yield put({
    type: DeliveryTypes.OPTIMIZE_STOPS,
    currentLocation: device.position.coords,
    returnPosition: device.returnPosition
  });
  NavigationService.goBack();
};

export const updateReturnPosition = function* ({ clear }) {
  const device = yield select(deviceSelector);
  let returnPosition = device?.position?.coords || null;
  if (clear) {
    returnPosition = null;
  }
  yield put({
    type: DeviceTypes.UPDATE_PROPS,
    props: { returnPosition }
  });
};

export const updatedSelectedStop = function* () {
  const selectedStop = yield select(selectedStopSelector);
  const device = yield select(deviceSelector);
  if (device && device.position && device.position.coords && selectedStop) {
    yield put({
      type: Api.API_CALL,
      actions: {
        success: { type: DeliveryTypes.UPDATE_DIRECTIONS_POLYLINE }
      },
      promise: Api.repositories.delivery.updateDirectionsPolyline({
        origin: `${device.position.coords.latitude},${device.position.coords.longitude}`,
        destination: `${selectedStop.latitude},${selectedStop.longitude}`
      })
    });
  }
};
