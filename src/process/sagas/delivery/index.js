import { call, delay, put, select } from 'redux-saga/effects';

import Api from 'Api';
import { user as userSelector } from 'Reducers/user';
import {
  completedStopsIds as completedStopsIdsSelector,
  deliveryStatus as deliveryStatusSelector,
  outOfStockItems as outOfStockItemsSelector,
  orderedStopsIds as orderedStopsIdsSelector,
  selectedStop as selectedStopSelector,
  isOptimizedRoutes as optimizedRoutesSelector,
  stops as stopsSelector,
  Types as DeliveryTypes
} from 'Reducers/delivery';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from 'Reducers/device';
import Analytics, { EVENTS } from 'Services/analytics';

import { currentDay as cDay } from 'Helpers';

const updateTrackerData = function* ({ deliveryStatus }) {
  const user = yield select(userSelector);
  const device = yield select(deviceSelector);
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
      id: `${user.driverId}`,
      deliveryStatus: stringifiedDeliveryStatus,
      ...(device.position?.coords && { location: device.position.coords })
    })
  });
};

// EXPORTED
export const acknowledgeClaim = function* ({ id }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.ACKNOWLEDGE_CLAIM_SUCCESS }
    },
    promise: Api.repositories.delivery.acknowledgeClaim({ id })
  });
};

export const driverReply = function* ({ claimId, comment, image, imageType }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.DRIVER_REPLY_SUCCESS }
    },
    promise: Api.repositories.delivery.driverReply({
      claimId,
      comment,
      image,
      imageType
    })
  });
};

export const driverReplySuccess = function* ({ payload }) {
  yield put({ type: DeliveryTypes.ACKNOWLEDGE_CLAIM, id: payload.claimId });
};

export const getForDriver = function* ({ isRefreshData = false }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_FOR_DRIVER_SUCCESS },
      fail: { type: DeliveryTypes.UPDATE_PROPS }
    },
    promise: Api.repositories.delivery.getForDriver(),
    props: { processing: false, isRefreshData }
  });
  Analytics.trackEvent(EVENTS.GET_FOR_DRIVER);
};

export const getForDriverSuccess = function* ({
  payload,
  props: { isRefreshData }
}) {
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
    props: { processing: false, isRefreshData }
  });
  Analytics.trackEvent(EVENTS.GET_FOR_DRIVER_SUCCESSFUL, {
    payload
  });
};

export const getVehicleStockForDriverSuccess = function* ({
  payload,
  props: { isRefreshData }
}) {
  const deliveryStatus = yield select(deliveryStatusSelector);

  if (!isRefreshData && deliveryStatus === 2) {
    yield put({
      type: DeliveryTypes.START_DELIVERING
    });
  } else {
    yield put({
      type: DeliveryTypes.UPDATE_PROPS,
      props: { processing: false }
    });
  }
  yield call(updateTrackerData, { deliveryStatus });
  Analytics.trackEvent(EVENTS.GET_STOCK_WITH_DATA_SUCCESSFULL, {
    payload
  });
};

export const setDelivered = function* ({ id }) {
  const outOfStockItems = yield select(outOfStockItemsSelector);
  const device = yield select(deviceSelector);

  for (const i of outOfStockItems) {
    yield put({ type: DeliveryTypes.SET_ITEM_OUT_OF_STOCK, id: i });
  }

  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_DELIVERED_OR_REJECTED_SUCCESS },
      fail: { type: DeliveryTypes.SET_DELIVERED_OR_REJECTED_FAILURE }
    },
    promise: Api.repositories.delivery.patchDelivered(
      id,
      device.position?.coords.latitude,
      device.position?.coords.longitude
    )
  });
  Analytics.trackEvent(EVENTS.TAP_DONE_DELIVER, { id });
};

export const setDeliveredOrRejectedSuccess = function* () {
  const completedStopsIds = yield select(completedStopsIdsSelector);
  const deliveryStatus = yield select(deliveryStatusSelector);
  const isOptimizedRoutes = yield select(optimizedRoutesSelector);
  const orderedStopsIds = yield select(orderedStopsIdsSelector);
  const stops = yield select(stopsSelector);
  const user = yield select(userSelector);

  const totalDeliveries = Object.keys(stops).length;
  const deliveriesLeft = orderedStopsIds.length;

  if (deliveriesLeft > 0 && isOptimizedRoutes) {
    yield call(updatedSelectedStop);
  }

  yield call(updateTrackerData, { deliveryStatus });

  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.fleet.drivers({
      id: `${user.driverId}`,
      deliveries: {
        completed: totalDeliveries - deliveriesLeft,
        total: totalDeliveries,
        completedStopsIds
      }
    })
  });
  Analytics.trackEvent(EVENTS.SET_DELIVERED_OR_REJECTED_SUCCESS);
};

export const setItemOutOfStock = function* ({ id }) {
  yield put({
    type: Api.API_CALL,
    actions: {},
    promise: Api.repositories.delivery.patchItemOutOfStock(id)
  });
  Analytics.trackEvent(EVENTS.SET_ITEM_OUT_OF_STOCK, { id });
};

export const setRejected = function* ({ id, reasonMessage }) {
  // TODO - trigger out of stock requests even in reject delivery mode
  const device = yield select(deviceSelector);

  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_DELIVERED_OR_REJECTED_SUCCESS },
      fail: { type: DeliveryTypes.SET_DELIVERED_OR_REJECTED_FAILURE }
    },
    promise: Api.repositories.delivery.patchRejected(
      id,
      reasonMessage,
      device.position?.coords.latitude,
      device.position?.coords.longitude
    ),
    id
  });
  Analytics.trackEvent(EVENTS.TAP_SKIP_DELIVERY, {
    id,
    reasonMessage
  });
};

export const optimizeStops = function* () {
  yield call(updatedSelectedStop);
  Analytics.trackEvent(EVENTS.OPTIMIZE_STOPS);
};

export function* setCurrentDay({}) {
  const currentDay = cDay();
  yield put({ type: DeviceTypes.UPDATE_PROPS, props: { currentDay } });
}

export const startDelivering = function* () {
  const device = yield select(deviceSelector);
  const isOptimizedRoutes = yield select(optimizedRoutesSelector);

  if (isOptimizedRoutes) {
    yield delay(750); // delay required because lots of animations + transitions + navigation + processing result in sluggish interface dropping frames. slight delay here makes everything smooth

    yield put({
      type: DeliveryTypes.OPTIMIZE_STOPS,
      currentLocation: device.position.coords,
      returnPosition: device.returnPosition
    });
  }
  Analytics.trackEvent(EVENTS.START_DELIVERING);
};

export const updateCurrentDayProps = function* ({ props: { deliveryStatus } }) {
  const user = yield select(userSelector);
  if (user && deliveryStatus) {
    yield call(updateTrackerData, { deliveryStatus });
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
        originLatitude: device.position.coords.latitude,
        originLongitude: device.position.coords.longitude,
        destinationLatitude: selectedStop.latitude,
        destinationLongitude: selectedStop.longitude
      })
    });
  }

  if (
    selectedStop.satisfactionStatus === 3 ||
    selectedStop.satisfactionStatus === 4
  ) {
    yield put({
      type: DeliveryTypes.GET_CUSTOMER_CLAIMS,
      customerId: selectedStop.customerId
    });
  }

  if (!selectedStop.customerAddressImage) {
    yield put({
      type: Api.API_CALL,
      actions: {
        success: { type: DeliveryTypes.SET_SELECTED_STOP_IMAGE }
      },
      promise: Api.repositories.delivery.getCustomerAddressImage({
        customerId: selectedStop.customerId,
        addressId: selectedStop.key
      }),
      props: { key: selectedStop.key }
    });
  }

  Analytics.trackEvent(EVENTS.UPDATE_SELECTED_STOP, {
    selectedStop: {
      ...selectedStop,
      orders: Object.keys(selectedStop.orders)
    }
  });
};

export const getCustomerClaims = function* ({ customerId }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_CUSTOMER_CLAIMS }
    },
    promise: Api.repositories.delivery.getCustomerClaims({ customerId })
  });
};
