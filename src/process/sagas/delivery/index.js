import { call, put, select } from 'redux-saga/effects';

import Api from 'Api';
import NavigationService from 'Navigation/service';
import { user as userSelector } from 'Reducers/user';
import {
  outOfStockItems as outOfStockItemsSelector,
  selectedStop as selectedStopSelector,
  Types as DeliveryTypes
} from 'Reducers/delivery';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from 'Reducers/device';

import { checkAtLeastOneItem } from 'Helpers';

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

  if (checkAtLeastOneItem(payload?.items, 2)) {
    yield put({
      type: DeliveryTypes.START_DELIVERING
    });
  }
};

export const setDelivered = function* ({ id }) {
  const outOfStockItems = yield select(outOfStockItemsSelector);
  for (const i of outOfStockItems) {
    yield put({ type: DeliveryTypes.SET_ITEM_OUT_OF_STOCK, id: i });
  }

  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_DELIVERED_OR_REJECTED_SUCCESS }
    },
    promise: Api.repositories.delivery.patchDelivered(id),
    id
  });
};

export const setItemOutOfStock = function* ({ id }) {
  yield put({
    type: Api.API_CALL,
    actions: {},
    promise: Api.repositories.delivery.patchItemOutOfStock(id)
  });
};

export const setRejected = function* ({ id, reasonMessage }) {
  // TODO - trigger out of stock requests even in reject delivery mode
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_DELIVERED_OR_REJECTED_SUCCESS }
    },
    promise: Api.repositories.delivery.patchRejected(id, reasonMessage),
    id
  });

  NavigationService.goBack();
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
};

export const updateCurrentDayProps = function* ({ props: { deliveryStatus } }) {
  const user = yield select(userSelector);
  if (user && deliveryStatus) {
    let stringifiedDeliveryStatus = 'NCI';
    switch (deliveryStatus) {
      case 1:
      case 2:
        stringifiedDeliveryStatus = 'DELIVERING';
        break;
      case 3:
        stringifiedDeliveryStatus = 'DELIVERY_COMPLETE';
        break;
    }
    yield put({
      type: Api.API_CALL,
      promise: Api.repositories.fleet.drivers({
        id: `${user.id}`,
        deliveryStatus: stringifiedDeliveryStatus
      })
    });
  }
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
