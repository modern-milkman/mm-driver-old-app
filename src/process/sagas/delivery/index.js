import { call, delay, put, select } from 'redux-saga/effects';

import Api from 'Api';
import I18n from 'Locales/I18n';
import { Base64 } from 'js-base64';
import { base64ToHex, deliveryStates as DS } from 'Helpers';
import NavigationService from 'Navigation/service';
import { Types as GrowlTypes } from 'Reducers/growl';
import { user as userSelector } from 'Reducers/user';
import Analytics, { EVENTS } from 'Services/analytics';
import { userSessionPresent as userSessionPresentSelector } from 'Reducers/application';
import {
  checklist as checklistSelector,
  claims as claimsSelector,
  completedStopsIds as completedStopsIdsSelector,
  isOptimizedRoutes as optimizedRoutesSelector,
  orderedStopsIds as orderedStopsIdsSelector,
  outOfStockItems as outOfStockItemsSelector,
  selectedStop as selectedStopSelector,
  selectedStopId as selectedStopIdSelector,
  status as statusSelector,
  stops as stopsSelector,
  Types as DeliveryTypes
} from 'Reducers/delivery';
import {
  Types as DeviceTypes,
  device as deviceSelector
} from 'Reducers/device';

const updateTrackerData = function* ({ status }) {
  const user = yield select(userSelector);
  const device = yield select(deviceSelector);
  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.fleet.drivers({
      id: `${user.driverId}`,
      deliveryStatus: status,
      ...(device.position?.coords && { location: device.position.coords })
    })
  });
};

// EXPORTED
export const acknowledgeClaim = function* ({ id, selectedStopId }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.ACKNOWLEDGE_CLAIM_SUCCESS },
      fail: { type: DeliveryTypes.ACKNOWLEDGE_CLAIM_FAILURE }
    },
    promise: Api.repositories.delivery.acknowledgeClaim({ id }),
    selectedStopId
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
    actions: {
      success: { type: DeliveryTypes.DRIVER_REPLY_SUCCESS },
      fail: { type: DeliveryTypes.DRIVER_REPLY_FAILURE }
    },
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
        id: payload.claimDriverResponseId,
        selectedStopId
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
    yield put({
      type: DeliveryTypes.ACKNOWLEDGE_CLAIM,
      id: payload.claimId,
      selectedStopId
    });
  } else {
    NavigationService.goBack();
  }
};

export const foregroundDeliveryActions = function* ({}) {
  const status = yield select(statusSelector);
  if (status === DS.NCI) {
    yield put({ type: DeliveryTypes.GET_PRODUCTS_ORDER });
  }
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

export const getDriverDataFailure = function* ({}) {
  const status = yield select(statusSelector);
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
          status === DS.DEL ? 'message' : 'refreshMessage'
        }`
      ),
      ...(status !== DS.DEL && {
        interval: -1,
        payload: {
          action: DeliveryTypes.REFRESH_DRIVER_DATA
        }
      })
    }
  });
};

export const getDriverReplySingleImage = function* ({ id, selectedStopId }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_DRIVER_REPLY_SINGLE_IMAGE_SUCCESS }
    },
    promise: Api.repositories.delivery.getDriverResponseImage({ id }),
    id,
    selectedStopId
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

export const getVehicleChecks = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_VEHICLE_CHECKS },
      fail: { type: DeliveryTypes.UPDATE_PROPS }
    },
    promise: Api.repositories.delivery.getVehicleChecks(),
    props: { processing: false }
  });
};

export const getVehicleStockForDriverSuccess = function* ({
  payload,
  props: { isRefreshData }
}) {
  const checklist = yield select(checklistSelector);
  const status = yield select(statusSelector);
  if (!isRefreshData && !checklist.deliveryComplete && status === DS.DEL) {
    yield put({
      type: DeliveryTypes.START_DELIVERING
    });
  }
  Analytics.trackEvent(EVENTS.GET_STOCK_WITH_DATA_SUCCESSFULL, {
    payload
  });
};

export const optimizeStops = function* () {
  const sID = yield select(selectedStopIdSelector);
  yield call(updateSelectedStop, sID);
  Analytics.trackEvent(EVENTS.OPTIMIZE_STOPS);
};

export const redirectSetSelectedClaim = function* () {
  NavigationService.navigate({ routeName: 'CustomerIssueDetails' });
};

export const refreshDriverData = function* () {
  const status = yield select(statusSelector);

  yield put({ type: DeliveryTypes.GET_FOR_DRIVER, isRefreshData: true });
  Analytics.trackEvent(EVENTS.REFRESH_DRIVER_DATA, { status });
};

export const saveVehicleChecks = function* ({ saveType }) {
  const checklist = yield select(checklistSelector);

  const vehicleCheckDamage = Object.values(
    checklist.payload.vehicleCheckDamage
  ).map((damage, index) => {
    const images = damage.vehicleCheckDamageImage.map((image) => ({
      imageType: image.imageType,
      image: base64ToHex(image.image)
    }));

    return {
      locationOfDamage: Object.keys(checklist.payload.vehicleCheckDamage)[
        index
      ],
      comments: damage.comments,
      vehicleCheckDamageImage: images
    };
  });

  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SAVE_VEHICLE_CHECKS_SUCCESS },
      fail: { type: DeliveryTypes.SAVE_VEHICLE_CHECKS_FAILURE }
    },
    promise: Api.repositories.delivery.postVechicleChecks({
      payload: {
        ...checklist.payload,
        vehicleCheckDamage,
        currentMileage: parseInt(checklist.payload.currentMileage)
      }
    }),
    saveType
  });
};

export const saveVehicleChecksFailure = function* ({ saveType }) {
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'error',
      title: I18n.t('alert:errors.api.backend.title', { status: 'BE' }),
      message: I18n.t('alert:errors.api.backend.message')
    }
  });
};

export const saveVehicleChecksSuccess = function* () {
  yield put({ type: DeliveryTypes.RESET_CHECKLIST_PAYLOAD });
  NavigationService.navigate({ routeName: 'CheckIn' });
};

export const showMustComplyWithTerms = function* () {
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'error',
      title: I18n.t('alert:errors.vanChecks.mustComplyWithTerms.title'),
      message: I18n.t('alert:errors.vanChecks.mustComplyWithTerms.message')
    }
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
  const status = yield select(statusSelector);
  const isOptimizedRoutes = yield select(optimizedRoutesSelector);
  const orderedStopsIds = yield select(orderedStopsIdsSelector);
  const stops = yield select(stopsSelector);
  const user = yield select(userSelector);
  const sID = orderedStopsIds[0];

  const totalDeliveries = Object.keys(stops).length;
  const deliveriesLeft = orderedStopsIds.length;

  if (deliveriesLeft > 0 && isOptimizedRoutes) {
    yield call(updateSelectedStop, sID);
  }

  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.fleet.drivers({
      id: `${user.driverId}`,
      deliveryStatus: status,
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
  yield put({ type: DeliveryTypes.GET_VEHICLE_CHECKS });
};

export const setVehicleChecks = function* () {
  const user_session = yield select(userSessionPresentSelector);
  if (user_session) {
    yield put({ type: DeliveryTypes.GET_FOR_DRIVER });
  }
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

export const startDelivering = function* () {
  const device = yield select(deviceSelector);
  const isOptimizedRoutes = yield select(optimizedRoutesSelector);
  const status = yield select(statusSelector);

  if (isOptimizedRoutes) {
    yield delay(750); // delay required because lots of animations + transitions + navigation + processing result in sluggish interface dropping frames. slight delay here makes everything smooth

    yield put({
      type: DeliveryTypes.OPTIMIZE_STOPS,
      currentLocation: device.position.coords,
      returnPosition: device.returnPosition
    });
  }
  yield call(updateTrackerData, { status });
  Analytics.trackEvent(EVENTS.START_DELIVERING);
};

export const updateProps = function* ({ props: { status } }) {
  const user = yield select(userSelector);
  if (user && status) {
    yield call(updateTrackerData, { status });
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
