import { put, select } from 'redux-saga/effects';

import Api from 'Api';
import NavigationService from 'Navigation/service';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { device as deviceSelector } from 'Reducers/device';

// EXPORTED
export const getForDriver = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_FOR_DRIVER_SUCCESS }
    },
    promise: Api.repositories.delivery.getForDriver()
  });
};

export const getForDriverSuccess = function* ({ payload }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: {
        type: DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS
      }
    },
    promise: Api.repositories.delivery.getVehicleStockForDriver(),
    deliveryDate: payload.deliveryDate
  });
};

export const startDelivering = function* () {
  const device = yield select(deviceSelector);
  yield put({
    type: DeliveryTypes.OPTIMIZE_STOPS,
    currentLocation: device.position.coords
  });
  NavigationService.goBack();
};
