import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import { call, put, select } from 'redux-saga/effects';

import Api from 'Api';
import I18n from 'Locales/I18n';
import Repositories from 'Repositories';
import NavigationService from 'Navigation/service';
import { Types as GrowlTypes } from 'Reducers/growl';
import { user as userSelector } from 'Reducers/user';
import Analytics, { EVENTS } from 'Services/analytics';
import { base64ToHex, deliveryStates as DS, distance } from 'Helpers';
import { Types as TransientTypes } from 'Reducers/transient';
import { userSessionPresent as userSessionPresentSelector } from 'Reducers/application';
import {
  checklist as checklistSelector,
  completedStopsIds as completedStopsIdsSelector,
  optimisedRouting as optimisedRoutingSelector,
  orderedStopsIds as orderedStopsIdsSelector,
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

export const driverReply = function* ({
  claimId,
  comment,
  image,
  imageType,
  acknowledgedClaim,
  index
}) {
  const sID = yield select(selectedStopIdSelector);
  const stops = yield select(stopsSelector);

  let imageHex = null;
  if (image) {
    let base64Image = yield Repositories.filesystem.readFile(image, 'base64');

    imageHex = base64ToHex(base64Image);
  }

  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.delivery.driverReply({
      claimId,
      comment,
      image: imageHex,
      imageType
    }),
    image,
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
  const status = yield select(statusSelector);
  const user_session = yield select(userSessionPresentSelector);

  //iOS lagging behind bug
  // yield put({ type: DeviceTypes.ENSURE_MANDATORY_PERMISSIONS });

  if (status === DS.NCI && user_session) {
    yield put({ type: DeliveryTypes.GET_PRODUCTS_ORDER });
    yield put({ type: DeliveryTypes.GET_REJECT_DELIVERY_REASONS });
    yield put({ type: DeliveryTypes.GET_CANNED_CONTENT });
    yield put({ type: DeliveryTypes.GET_BUNDLE_PRODUCTS });
  }
  if (user_session) {
    yield put({ type: DeliveryTypes.INIT_CHECKLIST });
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
        fromUrl: `${Config.SERVER_URL}${Config.SERVER_URL_BASE}/Customer/CustomerImageFile/${stop.customerId}/${stop.key}`,
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

export const getRejectDeliveryReasons = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: DeliveryTypes.SET_REJECT_DELIVERY_REASONS },
      fail: { type: DeliveryTypes.UPDATE_PROPS }
    },
    promise: Api.repositories.delivery.getReasons(),
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

export const getVehicleStockForDriverSuccess = function* ({ payload }) {
  const checklist = yield select(checklistSelector);
  const status = yield select(statusSelector);
  const optimisedRouting = yield select(optimisedRoutingSelector);
  // TODO
  if (optimisedRouting && !checklist.deliveryComplete && status === DS.DEL) {
    yield put({
      type: DeliveryTypes.CONTINUE_DELIVERING
    });
  }
  Analytics.trackEvent(EVENTS.GET_STOCK_WITH_DATA_SUCCESSFULL, {
    payload
  });
};

export const redirectSetSelectedClaimId = function* () {
  NavigationService.navigate({ routeName: 'CustomerIssueDetails' });
};

export const saveVehicleChecks = function* ({ saveType }) {
  NavigationService.navigate({ routeName: 'CheckIn' });
  const checklist = yield select(checklistSelector);
  let vehicleCheckDamage = [];

  for (let [index, damage] of Object.values(
    checklist.payload.vehicleCheckDamage
  ).entries()) {
    vehicleCheckDamage.push({
      locationOfDamage: Object.keys(checklist.payload.vehicleCheckDamage)[
        index
      ],
      comments: damage.comments,
      vehicleCheckDamageImage: []
    });

    for (let image of damage.vehicleCheckDamageImage) {
      let base64Image = yield Repositories.filesystem.readFile(
        image.imagePath,
        'base64'
      );

      vehicleCheckDamage[index].vehicleCheckDamageImage.push({
        imageType: image.imageType,
        image: base64ToHex(base64Image)
      });
    }
  }

  yield put({
    type: Api.API_CALL,
    promise: Api.repositories.delivery.postVechicleChecks({
      payload: {
        ...checklist.payload,
        vehicleCheckDamage,
        currentMileage: parseInt(checklist.payload.currentMileage)
      }
    })
  });
  yield put({ type: DeliveryTypes.RESET_CHECKLIST_PAYLOAD });
};

//TODO
export const setDeliveredOrRejected = function* (
  requestType,
  { id, outOfStockIds, selectedStopId, reasonType, reasonMessage }
) {
  const completedStopsIds = yield select(completedStopsIdsSelector);
  const device = yield select(deviceSelector);
  const optimisedRouting = yield select(optimisedRoutingSelector);
  const orderedStopsIds = yield select(orderedStopsIdsSelector);
  const status = yield select(statusSelector);
  const stops = yield select(stopsSelector);
  const user = yield select(userSelector);

  const { position, requestQueues } = device;
  const totalDeliveries = Object.keys(stops).length;
  const deliveriesLeft = orderedStopsIds.length;

  const promisePayload = {
    orderId: id,
    deliveryLocationLatitude: position?.latitude,
    deliveryLocationLongitude: position?.longitude
  };
  const promise =
    requestType === 'delivered'
      ? Api.repositories.delivery.patchDelivered
      : Api.repositories.delivery.patchRejected;

  if (optimisedRouting) {
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

  yield put({
    type: Api.API_CALL,
    promise: promise({
      ...promisePayload,
      ...(requestType === 'rejected' && {
        reasonType,
        description: reasonMessage
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
    yield put({
      type: GrowlTypes.ALERT,
      props: {
        type: 'error',
        title: I18n.t('alert:errors.reports.data.title'),
        message: I18n.t('alert:errors.reports.data.message'),
        interval: -1,
        payload: {
          action: DeviceTypes.SHARE_OFFLINE_DATA
        }
      }
    });
  }

  Analytics.trackEvent(
    requestType === 'delivered'
      ? EVENTS.TAP_DONE_DELIVER
      : EVENTS.TAP_SKIP_DELIVERY,
    {
      id,
      ...(requestType === 'rejected' && { reasonType, reasonMessage })
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

export const setProductsOrder = function* ({ payload }) {
  yield put({ type: DeliveryTypes.GET_VEHICLE_CHECKS });

  for (const i of payload) {
    Api.repositories.delivery.getProductImage(i);
  }
};

export const setVehicleChecks = function* () {
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

export const updateProps = function* ({ props: { status } }) {
  const user = yield select(userSelector);
  if (user && status) {
    yield call(updateTrackerData, { status });
  }
};

export const updateDriverActivity = function* () {
  const user = yield select(userSelector);

  for (const i of user.routes) {
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
