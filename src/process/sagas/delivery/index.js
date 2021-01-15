import { call, delay, put, select } from 'redux-saga/effects';

import Api from 'Api';
import I18n from 'Locales/I18n';
import { Base64 } from 'js-base64';
import NavigationService from 'Navigation/service';
import { Types as GrowlTypes } from 'Reducers/growl';
import { user as userSelector } from 'Reducers/user';
import Analytics, { EVENTS } from 'Services/analytics';
import {
  claims as claimsSelector,
  selectedStopId as selectedStopIdSelector,
  completedStopsIds as completedStopsIdsSelector,
  deliveryStatus as deliveryStatusSelector,
  isOptimizedRoutes as optimizedRoutesSelector,
  orderedStopsIds as orderedStopsIdsSelector,
  outOfStockItems as outOfStockItemsSelector,
  selectedStop as selectedStopSelector,
  stops as stopsSelector,
  Types as DeliveryTypes
} from 'Reducers/delivery';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from 'Reducers/device';

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

export const acknowledgeClaimSuccess = function* () {
  const claims = yield select(claimsSelector);
  const { showClaimModal, showReplyModal } = claims;
  if (!showClaimModal && !showReplyModal) {
    NavigationService.goBack();
  }
};

export const driverReply = function* ({
  claimId,
  comment,
  image,
  imageType,
  acknowledgedClaim = true
}) {
  let imageHex = null;
  if (image) {
    const splitImage = image.split(',');
    const base = splitImage[splitImage.length - 1];
    imageHex = [...Base64.atob(base)]
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, 0))
      .join('')
      .toUpperCase();
  }

  yield put({
    type: Api.API_CALL,
    actions: { success: { type: DeliveryTypes.DRIVER_REPLY_SUCCESS } },
    promise: Api.repositories.delivery.driverReply({
      claimId,
      comment,
      image: imageHex,
      imageType
    }),
    acknowledgedClaim
  });
};

export const driverReplySuccess = function* ({ payload, acknowledgedClaim }) {
  const claims = yield select(claimsSelector);
  const selectedStopId = yield select(selectedStopIdSelector);
  const {
    selectedClaim: { customerIssueIdx }
  } = claims[selectedStopId];

  if (payload.hasImage) {
    yield call(
      getDriverReplySingleImage.bind(null, {
        id: payload.claimDriverResponseId
      })
    );
  }

  yield put({
    type: DeliveryTypes.SET_SELECTED_CLAIM,
    claim: {
      ...claims[selectedStopId].list.filter(
        (claim) => claim.claimId === payload.claimId
      )[0],
      customerIssueIdx
    }
  });

  if (acknowledgedClaim) {
    yield put({ type: DeliveryTypes.ACKNOWLEDGE_CLAIM, id: payload.claimId });
  } else {
    NavigationService.goBack();
  }
};

export const foregroundDeliveryActions = function* ({}) {
  const deliveryStatus = yield select(deliveryStatusSelector);
  if (deliveryStatus === 0) {
    yield put({ type: DeliveryTypes.GET_PRODUCTS_ORDER });
  }
};

export const getDriverDataFailure = function* ({}) {
  const deliveryStatus = yield select(deliveryStatusSelector);
  yield put({
    type: DeliveryTypes.UPDATE_PROPS,
    props: { processing: false }
  });
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'error',
      title: I18n.t('alert:errors.api.driverData.title'),
      message: I18n.t(
        `alert:errors.api.driverData.${
          deliveryStatus < 2 ? 'refreshMessage' : 'message'
        }`
      ),
      ...(deliveryStatus < 2 && {
        interval: -1,
        payload: {
          action: DeliveryTypes.REFRESH_DRIVER_DATA
        }
      })
    }
  });
};

export const getDriverReplySingleImage = function* ({ id }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_DRIVER_REPLY_SINGLE_IMAGE_SUCCESS }
    },
    promise: Api.repositories.delivery.getDriverResponseImage({ id }),
    id
  });
};

export const getForDriver = function* ({ isRefreshData = false }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_FOR_DRIVER_SUCCESS },
      fail: { type: DeliveryTypes.GET_DRIVER_DATA_FAILURE }
    },
    promise: Api.repositories.delivery.getForDriver(),
    props: { isRefreshData }
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
      success: { type: DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS },
      fail: { type: DeliveryTypes.GET_DRIVER_DATA_FAILURE }
    },
    promise: Api.repositories.delivery.getVehicleStockForDriver(),
    deliveryDate: payload.deliveryDate,
    props: { isRefreshData }
  });
  Analytics.trackEvent(EVENTS.GET_FOR_DRIVER_SUCCESSFUL, {
    payload
  });
};

export const getProductsOrder = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_PRODUCTS_ORDER },
      fail: { type: DeliveryTypes.UPDATE_PROPS }
    },
    promise: Api.repositories.delivery.getProductsOrder(),
    props: { processing: false }
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

export const refreshDriverData = function* () {
  const deliveryStatus = yield select(deliveryStatusSelector);

  yield put({ type: DeliveryTypes.GET_FOR_DRIVER, isRefreshData: true });
  Analytics.trackEvent(EVENTS.REFRESH_DRIVER_DATA, { deliveryStatus });
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
    yield call(updateSelectedStop);
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

export const setProductsOrder = function* () {
  yield put({ type: DeliveryTypes.GET_FOR_DRIVER });
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

export const redirectSetSelectedClaim = function* () {
  NavigationService.navigate({ routeName: 'CustomerIssueDetails' });
};

export const optimizeStops = function* () {
  yield call(updateSelectedStop);
  Analytics.trackEvent(EVENTS.OPTIMIZE_STOPS);
};

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

export const updateProps = function* ({ props: { deliveryStatus } }) {
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

export const updateSelectedStop = function* ({ sID }) {
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
      customerId: selectedStop.customerId,
      selectedStopId: sID
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

export const getCustomerClaims = function* ({ customerId, selectedStopId }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_CUSTOMER_CLAIMS }
    },
    promise: Api.repositories.delivery.getCustomerClaims({ customerId }),
    selectedStopId
  });
};

export const setCustomerClaims = function* ({ payload, selectedStopId }) {
  for (const [claimIndex, claim] of payload.entries()) {
    for (const [
      driverResponseIndex,
      driverResponse
    ] of claim.driverResponses.entries()) {
      if (driverResponse.hasImage) {
        yield put({
          type: Api.API_CALL,
          actions: {
            success: { type: DeliveryTypes.SET_DRIVER_REPLY_IMAGE }
          },
          promise: Api.repositories.delivery.getDriverResponseImage({
            id: driverResponse.claimDriverResponseId
          }),
          claimIndex,
          driverResponseIndex,
          selectedStopId
        });
      }
    }
  }
};
