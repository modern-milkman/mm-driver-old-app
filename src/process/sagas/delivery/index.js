import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import { call, put, select } from 'redux-saga/effects';

import Api from 'Api';
import I18n from 'Locales/I18n';
import Repositories from 'Repositories';
import NavigationService from 'Services/navigation';
import { Types as GrowlTypes } from 'Reducers/growl';
import { user as userSelector } from 'Reducers/user';
import Analytics, { EVENTS } from 'Services/analytics';
import { deliveryStates as DS, distance } from 'Helpers';
import { Types as TransientTypes } from 'Reducers/transient';
import {
  rehydrated as rehydratedSelector,
  lastRoute as lastRouteSelector,
  userSessionPresent as userSessionPresentSelector
} from 'Reducers/application';
import {
  checklist as checklistSelector,
  completedStopsIds as completedStopsIdsSelector,
  isOptimised as isOptimisedSelector,
  orderedStock as orderedStockSelector,
  orderedStopsIds as orderedStopsIdsSelector,
  selectedStop as selectedStopSelector,
  selectedStopId as selectedStopIdSelector,
  serverAddressIds as serverAddressIdsSelector,
  routeId as routeIdSelector,
  status as statusSelector,
  stock as stockSelector,
  stops as stopsSelector,
  Types as DeliveryTypes
} from 'Reducers/delivery';
import {
  Types as DeviceTypes,
  autoSelectStop as autoSelectStopSelector,
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
      ...(device.position && { location: device.position })
    })
  });
};

// EXPORTED
// TODO delay
export const continueDelivering = function* () {
  const orderedStopsIds = yield select(orderedStopsIdsSelector);
  const status = yield select(statusSelector);

  if (orderedStopsIds.length > 0) {
    //yield delay(750); // TODO - when starting route from checkin
    // delay required because lots of animations + transitions + navigation + processing result in sluggish interface dropping frames.
    // slight delay here makes everything smooth
    yield put({
      type: DeliveryTypes.UPDATE_SELECTED_STOP,
      sID: orderedStopsIds[0]
    });
    Analytics.trackEvent(EVENTS.CONTINUE_DELIVERING);
  }

  yield call(updateTrackerData, { status });
};

export const deliverLater = function* () {
  const autoSelectStop = yield select(autoSelectStopSelector);
  const isOptimised = yield select(isOptimisedSelector);
  if (isOptimised && autoSelectStop) {
    yield put({
      type: DeliveryTypes.CONTINUE_DELIVERING
    });
  }
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'info',
      message: I18n.t('alert:success.main.deliverLater.confirmation')
    }
  });
};

export const driverReply = function* ({
  claimId,
  comment,
  acknowledgedClaim,
  index
}) {
  const sID = yield select(selectedStopIdSelector);
  const stops = yield select(stopsSelector);

  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.delivery.driverReply({
      claimId,
      comment
    }),
    index,
    acknowledgedClaim,
    selectedStopId: sID
  });
  yield put({ type: TransientTypes.RESET });
  if (
    acknowledgedClaim ||
    (!acknowledgedClaim && stops[sID].claims.unacknowledgedList.length === 0)
  ) {
    NavigationService.goBack();
  }
};

export const foregroundDeliveryActions = function* ({}) {
  const rehydrated = yield select(rehydratedSelector);
  if (rehydrated) {
    const lastRoute = yield select(lastRouteSelector);
    const user_session = yield select(userSessionPresentSelector);

    yield put({
      type: DeviceTypes.ENSURE_MANDATORY_PERMISSIONS,
      routeName: lastRoute
    });

    yield put({ type: DeliveryTypes.REFRESH_ALL_DATA });

    if (user_session) {
      yield put({ type: DeliveryTypes.INIT_CHECKLIST });
    }
  }
};

export const getBundleProducts = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_BUNDLE_PRODUCTS }
    },
    promise: Api.repositories.delivery.getAllBundleProducts()
  });
};

export const getCannedContent = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_CANNED_CONTENT }
    },
    promise: Api.repositories.delivery.getCannedContent()
  });
};

export const getCustomerClaims = function* ({ customerId, stopId }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_CUSTOMER_CLAIMS }
    },
    promise: Api.repositories.delivery.getCustomerClaims({ customerId }),
    customerId,
    stopId
  });
};

export const getDriverDataFailure = function* ({ status }) {
  const user_session = yield select(userSessionPresentSelector);
  yield put({
    type: DeliveryTypes.UPDATE_PROPS,
    props: { processing: false }
  });
  if (status !== 404 && user_session) {
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
            action: DeliveryTypes.GET_FOR_DRIVER
          }
        })
      }
    });
  }
};

export const getDriverReplyImage = function* ({ payload }) {
  for (let claims of payload) {
    for (let driverResponse of claims.driverResponses) {
      if (driverResponse.hasImage) {
        Api.repositories.delivery.getDriverResponseImage(
          driverResponse.claimDriverResponseId
        );
      }
    }
  }
};

export const getForDriver = function* () {
  const status = yield select(statusSelector);
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_FOR_DRIVER_SUCCESS },
      fail: { type: DeliveryTypes.GET_DRIVER_DATA_FAILURE }
    },
    promise: Api.repositories.delivery.getForDriver()
  });

  Analytics.trackEvent(EVENTS.GET_FOR_DRIVER, { status });
};

export const getForDriverSuccess = function* ({ payload }) {
  const stops = yield select(stopsSelector);
  const serverAddressIds = yield select(serverAddressIdsSelector);

  for (const stop of Object.values(stops)) {
    if (stop.satisfactionStatus === 3 || stop.satisfactionStatus === 4) {
      yield put({
        type: DeliveryTypes.GET_CUSTOMER_CLAIMS,
        customerId: stop.customerId,
        stopId: stop.key
      });
    }

    if (stop.hasImage) {
      Api.repositories.filesystem.downloadFile({
        fromUrl: `${Api.ADMIN_URL()}/Customer/CustomerImageFile/${
          stop.customerId
        }/${stop.key}`,
        toFile: `${RNFS.DocumentDirectoryPath}/${Config.FS_CUSTOMER_IMAGES}/${stop.customerId}-${stop.key}`
      });
    }
  }

  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS },
      fail: { type: DeliveryTypes.GET_DRIVER_DATA_FAILURE }
    },
    promise: Api.repositories.delivery.getVehicleStockForDriver(),
    deliveryDate: payload.deliveryDate
  });

  Analytics.trackEvent(EVENTS.GET_FOR_DRIVER_SUCCESSFUL, {
    payload,
    serverAddressIds
  });
};

export const getRejectDeliveryReasons = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_REJECT_DELIVERY_REASONS },
      fail: { type: DeliveryTypes.UPDATE_PROPS }
    },
    promise: Api.repositories.delivery.getReasons(),
    props: { processing: false, loaderInfo: null }
  });
};

export const getReturnTypes = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_RETURN_TYPES },
      fail: { type: DeliveryTypes.UPDATE_PROPS }
    },
    promise: Api.repositories.delivery.getReturnTypes(),
    props: { processing: false, loaderInfo: null }
  });
};

export const getVehicleStockForDriverSuccess = function* () {
  const autoSelectStop = yield select(autoSelectStopSelector);
  const checklist = yield select(checklistSelector);
  const isOptimised = yield select(isOptimisedSelector);
  const orderedStock = yield select(orderedStockSelector);
  const status = yield select(statusSelector);

  const productId = {};
  if (
    isOptimised &&
    autoSelectStop &&
    !checklist.deliveryComplete &&
    status === DS.DEL
  ) {
    yield put({
      type: DeliveryTypes.CONTINUE_DELIVERING
    });
  }
  for (const { productId: id, quantity } of orderedStock) {
    Api.repositories.delivery.getProductImage(id);
    productId[id] = quantity;
  }

  Analytics.trackEvent(EVENTS.GET_STOCK_WITH_DATA_SUCCESSFULL, {
    productId
  });
};

export const redirectSetSelectedClaimId = function* () {
  NavigationService.navigate({ routeName: 'CustomerIssueDetails' });
};

export const refreshAllData = function* () {
  // GETS MANDATORY DATA REQUIRED FOR APP TO WORK
  // rejectDeliveryReasons -> returnTypes -> getForDriver -> getVehicleStockForDriver |
  // cannedContent |
  // bundleProducts |
  const status = yield select(statusSelector);
  const user_session = yield select(userSessionPresentSelector);

  if (status === DS.NCI && user_session) {
    yield put({ type: DeliveryTypes.GET_REJECT_DELIVERY_REASONS });
    yield put({ type: DeliveryTypes.GET_CANNED_CONTENT });
    yield put({ type: DeliveryTypes.GET_BUNDLE_PRODUCTS });
  }
};

export const saveVehicleChecks = function* () {
  NavigationService.navigate({ routeName: 'CheckIn' });
  const checklist = yield select(checklistSelector);
  const payload = { ...checklist.payload };

  const returns = [];

  for (const { id, value } of Object.values(payload.emptiesCollected)) {
    if (parseInt(value) >= 0) {
      returns.push({ returnTypeId: id, quantity: parseInt(value) });
    }
  }
  delete payload.emptiesCollected;

  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.delivery.postVechicleChecks({
      payload: {
        ...payload,
        returns,
        ...(payload.shiftStart && {
          currentMileage: parseInt(payload.currentMileage)
        })
      }
    })
  });
  yield put({
    type: DeliveryTypes.UPDATE_CHECKLIST_PROPS,
    props: { emptiesRequired: !checklist.emptiesScreenDirty }
  });
  yield put({ type: DeliveryTypes.RESET_CHECKLIST_PAYLOAD });
};

export const setDeliveredOrRejected = function* (
  requestType,
  {
    hasCollectedEmpties,
    id,
    podImage,
    outOfStockIds,
    selectedStopId,
    reasonType,
    reasonMessage
  }
) {
  const completedStopsIds = yield select(completedStopsIdsSelector);
  const device = yield select(deviceSelector);
  const isOptimised = yield select(isOptimisedSelector);
  const orderedStopsIds = yield select(orderedStopsIdsSelector);
  const status = yield select(statusSelector);
  const stops = yield select(stopsSelector);
  const user = yield select(userSelector);
  const routeId = yield select(routeIdSelector);
  const selectedStop = stops[selectedStopId];
  const handledClaims = selectedStop.claims?.unacknowledgedListIds || [];

  const {
    autoOpenStopDetails,
    autoSelectStop,
    foregroundSize,
    optimisedStopsToShow,
    position,
    requestQueues,
    shouldPitchMap,
    shouldTrackHeading,
    shouldTrackLocation,
    showAllPendingStops,
    showDoneDeliveries
  } = device;
  const totalDeliveries = Object.keys(stops).length;
  const deliveriesLeft = orderedStopsIds.length;

  const promise =
    requestType === 'delivered'
      ? Api.repositories.delivery.postDelivered
      : Api.repositories.delivery.patchRejected;

  const promisePayload = {
    orderId: id,
    deliveryLocationLatitude: position?.latitude,
    deliveryLocationLongitude: position?.longitude
  };

  if (isOptimised && autoSelectStop) {
    yield put({
      type: DeliveryTypes.CONTINUE_DELIVERING
    });
  }

  for (const i of outOfStockIds) {
    yield put({
      type: DeliveryTypes.SET_ITEM_OUT_OF_STOCK,
      id: i
    });
  }

  let baseImage = '';

  if (podImage && requestType === 'delivered') {
    baseImage = yield Repositories.filesystem.readFile(podImage.path, 'base64');

    yield put({
      type: DeliveryTypes.ADD_POD_IMAGE_TO_DRIVER_CLAIM,
      image: `data:${podImage.mime};base64,${baseImage}`,
      handledClaims,
      stopId: selectedStopId
    });
  }

  yield put({
    type: Api.API_CALL,
    promise: promise({
      ...promisePayload,
      ...(requestType === 'rejected' && {
        reasonType: reasonType.id,
        description: reasonMessage
      }),
      ...(requestType === 'delivered' && {
        handledClaims: handledClaims,
        driverId: user.driverId,
        routeId: routeId,
        emptiesCollected: hasCollectedEmpties,
        ...(podImage && {
          podImage: baseImage,
          podImageType: podImage.mime
        })
      })
    })
  });

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

  if (
    status === DS.DELC &&
    (requestQueues.offline.length > 0 || requestQueues.failed.length > 0)
  ) {
    yield put({ type: DeviceTypes.SHARE_OFFLINE_DATA });
  }

  Analytics.trackEvent(
    requestType === 'delivered'
      ? EVENTS.TAP_DONE_DELIVER
      : EVENTS.TAP_SKIP_DELIVERY,
    {
      autoOpenStopDetails,
      autoSelectStop,
      foregroundSize,
      id,
      isOptimised,
      optimisedStopsToShow,
      ...(requestType === 'rejected' && { reasonType, reasonMessage }),
      requestQueues: {
        offline: requestQueues.offline?.length,
        failed: requestQueues.failed?.length
      },
      shouldPitchMap,
      shouldTrackHeading,
      shouldTrackLocation,
      showAllPendingStops,
      showDoneDeliveries
    }
  );
};

export const setItemOutOfStock = function* ({ id }) {
  yield put({
    type: Api.API_CALL,
    actions: {},
    promise: Api.repositories.delivery.patchItemOutOfStock(id)
  });
  Analytics.trackEvent(EVENTS.SET_ITEM_OUT_OF_STOCK, { id });
};

export const setReturnTypes = function* () {
  const user_session = yield select(userSessionPresentSelector);
  if (user_session) {
    yield put({ type: DeliveryTypes.GET_FOR_DRIVER });
  }
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

export const showPODRequired = function* () {
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'info',
      title: I18n.t('alert:success.delivery.proofOfDeliveryRequired.title'),
      message: I18n.t('alert:success.delivery.proofOfDeliveryRequired.message')
    }
  });
};

export const updateDriverActivity = function* () {
  const user = yield select(userSelector);
  const stock = yield select(stockSelector);

  for (const i of stock) {
    yield put({
      type: Api.API_CALL,
      promise: Api.repositories.delivery.postDriverActivity({
        driverId: user.driverId,
        routeId: i.routeId,
        createdDateTime: new Date(),
        driverActivityType: 1
      })
    });
  }
};

export const updateDirectionsPolyline = function* () {
  const device = yield select(deviceSelector);
  const selectedStop = yield select(selectedStopSelector);

  if (device && device.position && device.computeDirections && selectedStop) {
    const originLatitude = device.position.latitude;
    const originLongitude = device.position.longitude;
    const destinationLatitude = selectedStop.latitude;
    const destinationLongitude = selectedStop.longitude;

    const distanceToStop = distance(
      {
        x: originLatitude,
        y: originLongitude
      },
      {
        x: destinationLatitude,
        y: destinationLongitude
      },
      'ME'
    );

    if (
      distanceToStop > parseInt(Config.DIRECTIONS_THRESHOLD) ||
      device.computeShortDirections
    ) {
      yield put({
        type: Api.API_CALL,
        actions: {
          success: { type: DeliveryTypes.SET_DIRECTIONS_POLYLINE }
        },
        promise: Api.repositories.delivery.updateDirectionsPolyline({
          originLatitude: device.position.latitude,
          originLongitude: device.position.longitude,
          destinationLatitude: selectedStop.latitude,
          destinationLongitude: selectedStop.longitude
        })
      });
    }
  }
};

export const updateProps = function* ({ props: { status } }) {
  const user = yield select(userSelector);
  if (user && status) {
    yield call(updateTrackerData, { status });
  }
};

export const updateSelectedStop = function* ({ sID }) {
  const selectedStop = yield select(selectedStopSelector);

  if (sID) {
    yield put({
      type: DeliveryTypes.UPDATE_DIRECTIONS_POLYLINE
    });

    Analytics.trackEvent(EVENTS.UPDATE_SELECTED_STOP, {
      selectedStop: {
        ...selectedStop,
        orderItems: Object.keys(selectedStop.orderItems)
      }
    });
  }
};
