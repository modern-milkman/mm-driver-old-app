import { put } from 'redux-saga/effects';

import Api from 'Api';
import { Types as DeliveryTypes } from 'Reducers/delivery';

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
        type: DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS,
        fail: { type: DeliveryTypes.UPDATE_PROPS }
      }
    },
    promise: Api.repositories.delivery.getVehicleStockForDriver(),
    deliveryDate: payload.deliveryDate,
    props: { proccessing: false }
  });
};
