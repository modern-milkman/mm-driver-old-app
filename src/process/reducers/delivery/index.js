import Config from 'react-native-config';
import { createActions, createReducer } from 'reduxsauce';

import I18n from 'Locales/I18n';
import NavigationService from 'Navigation/service';
import { checkAtLeastOneItem, toggle } from 'Helpers';
import { Point, solve as salesman } from 'Services/salesman';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    acknowledgeClaim: ['id', 'selectedStopId'],
    acknowledgeClaimFailure: null,
    acknowledgeClaimSuccess: ['payload', 'selectedStopId'],
    driverReply: [
      'claimId',
      'comment',
      'image',
      'imageType',
      'acknowledgedClaim'
    ],
    driverReplyFailure: null,
    driverReplySuccess: ['payload', 'acknowledgedClaim'],
    foregroundDeliveryActions: null,
    getCustomerClaims: ['customerId', 'selectedStopId'],
    getDriverDataFailure: null,
    getDriverReplySingleImageSuccess: ['payload', 'id', 'selectedStopId'],
    getForDriver: ['isRefreshData'],
    getForDriverSuccess: ['payload', 'isRefreshData'],
    getProductsOrder: null,
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: [
      'payload',
      'deliveryDate',
      'isRefreshData'
    ],
    optimizeStops: ['currentLocation', 'returnPosition'],
    redirectSetSelectedClaim: ['claim'],
    refreshDriverData: null,
    setCustomerClaims: ['payload', 'selectedStopId'],
    setDelivered: ['id', 'selectedStopId'],
    setDeliveredOrRejectedFailure: ['selectedStopId'],
    setDeliveredOrRejectedSuccess: ['selectedStopId'],
    setDriverReplyImage: [
      'payload',
      'claimIndex',
      'driverResponseIndex',
      'selectedStopId'
    ],
    setItemOutOfStock: ['id'],
    setProductsOrder: ['payload'],
    setRejected: ['id', 'reasonMessage', 'selectedStopId'],
    setSelectedClaim: ['claim'],
    setSelectedStopImage: ['payload', 'props'],
    startDelivering: [],
    toggleConfirmedItem: ['id'],
    toggleOutOfStock: ['id'],
    toggleReplyModal: ['show'],
    updateDirectionsPolyline: ['payload'],
    updateDriverResponse: ['data'],
    updateProps: ['props'],
    updateReturnPosition: ['clear'],
    updateSelectedStop: ['sID']
  },
  { prefix: 'delivery/' }
);

/*
Delivery status:
  0-NOT_CHECKED_IN
  1-LOADED_VAN
  2-DELIVERING
  3-DELIVERY_COMPLETE
*/

const productImageUri = `${Config.SERVER_URL}${Config.SERVER_URL_BASE}/Product/Image/`;
const initialClaim = {
  driverResponse: { text: null, image: null, imageType: null },
  driverUnacknowledgedNr: 0,
  list: [],
  selectedClaim: null
};

const initialState = {
  allItemsDone: false,
  claims: { showClaimModal: false, showReplyModal: false, processing: false },
  completedStopsIds: [],
  confirmedItem: [],
  deliveryStatus: 0,
  directionsPolyline: [],
  hasRoutes: false,
  optimizedRoutes: false,
  orderedStock: [],
  orderedStopsIds: [],
  outOfStockIds: [],
  previousStopId: null,
  processing: true,
  selectedStopId: null,
  stock: [],
  stockWithData: {},
  stops: {}
};

const acknowledgeClaimSuccess = (state, { payload, selectedStopId }) =>
  produce(state, (draft) => {
    draft.claims[selectedStopId].list = draft.claims[selectedStopId].list.map(
      (item) => {
        if (item.claimId === payload.claimId) {
          return payload;
        }
        return item;
      }
    );

    const driverUnacknowledgedList = draft.claims[selectedStopId].list.filter(
      (item) => item.driverAcknowledged === false
    );

    if (driverUnacknowledgedList.length > 0) {
      draft.claims[selectedStopId].selectedClaim = driverUnacknowledgedList[0];
      draft.claims[selectedStopId].showedUnacknowledgedNr += 1;
      draft.claims.showReplyModal = false;
    } else {
      draft.claims.showClaimModal = false;
      NavigationService.goBack();
    }

    draft.claims.processing = false;
  });

const claimProcessing = (state) =>
  produce(state, (draft) => {
    draft.claims.processing = true;
  });

const claimFinishedProcessing = (state) =>
  produce(state, (draft) => {
    draft.claims.processing = false;
  });

const driverReplySuccess = (state, { payload, acknowledgeClaim }) =>
  produce(state, (draft) => {
    const selectedStopId = draft.selectedStopId;

    if (!acknowledgeClaim) {
      draft.claims[selectedStopId].list = draft.claims[selectedStopId].list.map(
        (claim) => {
          if (claim.claimId === payload.claimId) {
            claim.driverResponses.push(payload);
          }

          return claim;
        }
      );
    }

    draft.claims[selectedStopId].driverResponse = {
      text: null,
      image: null,
      imageType: null
    };

    draft.claims.processing = false;
  });

const processingTrue = (state) =>
  produce(state, (draft) => {
    draft.processing = true;
  });

const resetSelectedStopInfo = (draft) => {
  draft.directionsPolyline = [];
  draft.allItemsDone = false;
  draft.confirmedItem = [];
  draft.outOfStockIds = [];
};

export const getVehicleStockForDriverSuccess = (
  state,
  { deliveryDate, payload }
) =>
  produce(state, (draft) => {
    const misplacedProducts = {};

    draft.itemCount = 0;
    draft.stock = payload;
    draft.hasRoutes = payload.length > 0;
    draft.orderedStock = [];
    for (const route of payload) {
      route.vehicleStockItems.forEach((item) => {
        const formattedProduct = {
          description: item.measureDescription,
          disabled: true, // items in load van should not be tappable
          image: `${productImageUri}${item.productId}`,
          key: item.productId,
          miscelaneousTop: item.quantity,
          title: item.productName
        };

        if (draft.productsOrder.includes(item.productId)) {
          const productSortedIndex = draft.productsOrder.indexOf(
            item.productId
          );

          if (draft.orderedStock[productSortedIndex]) {
            draft.orderedStock[productSortedIndex].miscelaneousTop +=
              item.quantity;
          } else {
            draft.orderedStock[productSortedIndex] = formattedProduct;
          }
        } else {
          if (misplacedProducts[item.productId]) {
            misplacedProducts[item.productId].miscelaneousTop += item.quantity;
          } else {
            misplacedProducts[item.productId] = formattedProduct;
          }
        }
        draft.itemCount += item.quantity;
      });
    }
    draft.orderedStock = draft.orderedStock.filter((product) => product);

    if (Object.keys(misplacedProducts).length > 0) {
      for (const misplacedProductKey in misplacedProducts) {
        draft.orderedStock.push(misplacedProducts[misplacedProductKey]);
      }
    }
  });

export const getForDriverSuccess = (
  state,
  { payload, props: { isRefreshData = false } }
) =>
  produce(state, (draft) => {
    draft.stockWithData = payload;
    draft.stops = {};
    draft.orderedStopsIds = [];
    draft.completedStopsIds = [];

    const deliveryStatus = checkAtLeastOneItem(payload?.items, 1, true)
      ? checkAtLeastOneItem(payload?.items, 1)
        ? 2
        : 3
      : 0;

    if (!isRefreshData || deliveryStatus === 3) {
      draft.deliveryStatus = deliveryStatus;
    }

    // PREPARE RAW STOPS
    for (const item of draft.stockWithData.items) {
      const {
        address: { addressId: key, latitude, longitude, deliveryInstructions }
      } = item;

      if (!draft.stops[key]) {
        draft.stops[key] = {
          key,
          customerId: item.customerId,
          satisfactionStatus: item.satisfactionStatus || 0,
          description: I18n.t('screens:deliver.customerID', {
            customerId: item.customerId
          }),
          deliveryInstructions:
            deliveryInstructions && deliveryInstructions.length > 0
              ? deliveryInstructions
              : null,
          icon: null,
          itemCount: 0,
          latitude,
          longitude,
          orderID: item.orderID,
          orders: {},
          phoneNumber: item.phoneNumber,
          status: 'completed',
          title:
            (item.address.name_number ? `${item.address.name_number}` : '') +
            (item.address.line1 ? ` ${item.address.line1}` : '') +
            (item.address.postcodeOutward
              ? `, ${item.address.postcodeOutward}`
              : '') +
            (item.address.postcodeInward
              ? `${item.address.postcodeInward}`
              : '')
        };
      }

      if (item.delivery_stateID === 1) {
        if (!draft.orderedStopsIds.includes(key)) {
          draft.orderedStopsIds.push(key);
        }
        if (draft.stops[key].status === 'completed') {
          draft.stops[key].status = 'pending';
        }
      } else {
        if (!draft.completedStopsIds.includes(key)) {
          draft.completedStopsIds.push(key);
        }
      }

      draft.stops[key].orders[item.orderItemId] = {
        description: item.measureDescription,
        image: `${productImageUri}${item.productId}`,
        key: item.orderItemId,
        miscelaneousTop: item.quantity,
        title: item.productName
      };

      draft.stops[key].itemCount += item.quantity;
    }
  });

export const getDriverReplySingleImageSuccess = (
  state,
  { payload, id, selectedStopId }
) =>
  produce(state, (draft) => {
    draft.claims[selectedStopId].list = draft.claims[selectedStopId].list.map(
      (claim) => {
        for (const driverResponses of claim.driverResponses) {
          if (driverResponses.claimDriverResponseId === id) {
            driverResponses.image = payload;
          }
        }

        return claim;
      }
    );

    draft.claims[selectedStopId].selectedClaim.driverResponses = draft.claims[
      selectedStopId
    ].selectedClaim.driverResponses.map((dr) => {
      if (dr.claimDriverResponseId === id) {
        dr.image = payload;
      }
      return dr;
    });
  });

export const optimizeStops = (state, { currentLocation, returnPosition }) =>
  produce(state, (draft) => {
    let dummyIndex = null;
    let returnPositionIndex = null;
    const stops = [];

    if (currentLocation) {
      stops.push(
        new Point(
          currentLocation.latitude,
          currentLocation.longitude,
          'CURRENT_LOCATION'
        )
      );
    }

    for (const key of draft.orderedStopsIds) {
      const item = draft.stops[key];
      stops.push(new Point(item?.latitude, item?.longitude, key));
    }
    if (returnPosition) {
      stops.push(
        new Point(
          returnPosition.latitude,
          returnPosition.longitude,
          'RETURN_LOCATION'
        )
      );
      returnPositionIndex = stops.length - 1;
    }
    const hasDummy = stops.length > 2;

    if (hasDummy) {
      stops.push(new Point(0, 0)); //dummy TSP point
      dummyIndex = stops.length - 1;
    }
    const optimizedRoute = salesman(stops, hasDummy);

    if (currentLocation) {
      optimizedRoute.splice(0, 1);
    }

    if (hasDummy) {
      optimizedRoute.splice(optimizedRoute.indexOf(dummyIndex), 1);
    }
    if (returnPosition) {
      optimizedRoute.splice(optimizedRoute.indexOf(returnPositionIndex), 1);
    }
    draft.orderedStopsIds = [];
    optimizedRoute.map((i) => draft.orderedStopsIds.push(stops[i].key));
    draft.selectedStopId = draft.orderedStopsIds[0];
    draft.deliveryStatus = 2;
    draft.optimizedRoutes = true;
    draft.processing = false;
  });

export const reset = () => initialState;

export const setCustomerClaims = (state, { payload, selectedStopId }) =>
  produce(state, (draft) => {
    if (draft.selectedStopId === selectedStopId) {
      if (!draft.claims[selectedStopId]) {
        draft.claims[selectedStopId] = { ...initialClaim };
      }

      draft.claims[selectedStopId].list = payload;
      const driverUnacknowledgedList = draft.claims[selectedStopId].list.filter(
        (item) => item.driverAcknowledged === false
      );

      const driverUnacknowledgedLength = driverUnacknowledgedList.length;

      if (driverUnacknowledgedLength > 0) {
        draft.claims[selectedStopId].selectedClaim =
          driverUnacknowledgedList[0];
        draft.claims[
          selectedStopId
        ].driverUnacknowledgedNr = driverUnacknowledgedLength;
        draft.claims.showClaimModal = true;
        draft.claims[selectedStopId].showedUnacknowledgedNr = 1;
      }
    }
  });

export const setDeliveredOrRejectedFailure = (state) =>
  produce(state, (draft) => {
    resetSelectedStopInfo(draft);
    draft.processing = false;
  });

export const setDeliveredOrRejectedSuccess = (state, { selectedStopId }) =>
  produce(state, (draft) => {
    draft.completedStopsIds.push(
      ...draft.orderedStopsIds.splice(
        draft.orderedStopsIds.indexOf(selectedStopId),
        1
      )
    );
    resetSelectedStopInfo(draft);
    draft.stops[selectedStopId].status = 'completed';

    if (draft.orderedStopsIds.length > 0) {
      if (draft.selectedStopId === selectedStopId) {
        // user didn't tap on another pin while request was processing
        draft.selectedStopId = draft.orderedStopsIds[0];
        if (!draft.optimizedRoutes) {
          draft.selectedStopId = null;
        }
      }
    } else {
      draft.selectedStopId = null;
      draft.deliveryStatus = 3;
    }
    draft.processing = false;
  });

export const setDriverReplyImage = (
  state,
  { payload, claimIndex, driverResponseIndex, selectedStopId }
) =>
  produce(state, (draft) => {
    draft.claims[selectedStopId].list[claimIndex].driverResponses[
      driverResponseIndex
    ].image = payload;
  });

export const setProductsOrder = (state, { payload }) =>
  produce(state, (draft) => {
    draft.productsOrder = payload;
  });

export const setSelectedStopImage = (
  state,
  { payload: { base64Image }, props: { key } }
) =>
  produce(state, (draft) => {
    draft.stops[key].customerAddressImage = base64Image;
  });

export const setSelectedClaim = (state, { claim }) =>
  produce(state, (draft) => {
    const selectedStopId = draft.selectedStopId;
    draft.claims[selectedStopId].selectedClaim = claim;
  });

export const startDelivering = (state) =>
  produce(state, (draft) => {
    if (!state.optimizedRoutes) {
      draft.deliveryStatus = 2;
      draft.processing = false;
    } else {
      draft.processing = true;
    }
  });

export const toggleConfirmedItem = (state, { id }) =>
  produce(state, (draft) => {
    draft.confirmedItem = toggle(state.confirmedItem, id);

    const idx = state.outOfStockIds.indexOf(id);
    if (idx > -1) {
      draft.outOfStockIds.splice(idx, 1);
    }
    // TODO reuse code from toggleConfirmedItem / toggleOutOfStock as one
    draft.allItemsDone =
      draft.confirmedItem.length + draft.outOfStockIds.length ===
      Object.keys(state.stops[state.selectedStopId]?.orders).length;
  });

export const toggleOutOfStock = (state, { id }) =>
  produce(state, (draft) => {
    draft.outOfStockIds = toggle(state.outOfStockIds, id);
    const idx = state.confirmedItem.indexOf(id);
    if (idx > -1) {
      draft.confirmedItem.splice(idx, 1);
    }
    draft.allItemsDone =
      draft.confirmedItem.length + draft.outOfStockIds.length ===
      Object.keys(state.stops[state.selectedStopId]?.orders).length;
  });

export const toggleReplyModal = (state, { show }) =>
  produce(state, (draft) => {
    draft.claims.showReplyModal = show;
  });

export const updateDirectionsPolyline = (state, { payload }) =>
  produce(state, (draft) => {
    draft.directionsPolyline = payload;
  });

export const updateDriverResponse = (state, { data }) =>
  produce(state, (draft) => {
    const selectedStopId = draft.selectedStopId;
    draft.claims[selectedStopId].driverResponse = data;
  });

export const updateSelectedStop = (state, { sID }) =>
  produce(state, (draft) => {
    resetSelectedStopInfo(draft);
    if (draft.selectedStopId) {
      delete draft.stops[draft.selectedStopId].customerAddressImage; // Deletes customer image
    }

    draft.optimizedRoutes = false;
    draft.previousStopId = draft.selectedStopId;
    draft.processing = false;
    draft.selectedStopId = sID;
    draft.claims.showClaimModal = false;
    draft.claims.showReplyModal = false;
  });

export default createReducer(initialState, {
  [Types.ACKNOWLEDGE_CLAIM]: claimProcessing,
  [Types.ACKNOWLEDGE_CLAIM_FAILURE]: claimFinishedProcessing,
  [Types.ACKNOWLEDGE_CLAIM_SUCCESS]: acknowledgeClaimSuccess,
  [Types.DRIVER_REPLY]: claimProcessing,
  [Types.DRIVER_REPLY_FAILURE]: claimFinishedProcessing,
  [Types.DRIVER_REPLY_SUCCESS]: driverReplySuccess,
  [Types.GET_DRIVER_REPLY_SINGLE_IMAGE_SUCCESS]: getDriverReplySingleImageSuccess,
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_FOR_DRIVER]: processingTrue,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS]: getVehicleStockForDriverSuccess,
  [Types.OPTIMIZE_STOPS]: optimizeStops,
  [Types.REDIRECT_SET_SELECTED_CLAIM]: setSelectedClaim,
  [Types.SET_CUSTOMER_CLAIMS]: setCustomerClaims,
  [Types.SET_DELIVERED_OR_REJECTED_FAILURE]: setDeliveredOrRejectedFailure,
  [Types.SET_DELIVERED_OR_REJECTED_SUCCESS]: setDeliveredOrRejectedSuccess,
  [Types.SET_DELIVERED]: processingTrue,
  [Types.SET_DRIVER_REPLY_IMAGE]: setDriverReplyImage,
  [Types.SET_PRODUCTS_ORDER]: setProductsOrder,
  [Types.SET_REJECTED]: processingTrue,
  [Types.SET_SELECTED_CLAIM]: setSelectedClaim,
  [Types.SET_SELECTED_STOP_IMAGE]: setSelectedStopImage,
  [Types.START_DELIVERING]: startDelivering,
  [Types.TOGGLE_CONFIRMED_ITEM]: toggleConfirmedItem,
  [Types.TOGGLE_OUT_OF_STOCK]: toggleOutOfStock,
  [Types.TOGGLE_REPLY_MODAL]: toggleReplyModal,
  [Types.UPDATE_DIRECTIONS_POLYLINE]: updateDirectionsPolyline,
  [Types.UPDATE_DRIVER_RESPONSE]: updateDriverResponse,
  [Types.UPDATE_PROPS]: updateProps,
  [Types.UPDATE_SELECTED_STOP]: updateSelectedStop
});

export const claims = (state) => state.delivery?.claims;

export const completedStopsIds = (state) => state.delivery?.completedStopsIds;

export const deliveryStatus = (state) => state.delivery?.deliveryStatus;

export const hasItemsLeftToDeliver = (state) => {
  return checkAtLeastOneItem(state.delivery?.stockWithData?.items);
};

export const itemCount = (state) => state.delivery?.itemCount || 0;

export const outOfStockItems = (state) => state.delivery?.outOfStockIds;

export const orderedStopsIds = (state) => state.delivery?.orderedStopsIds;

export const selectedStop = (state) => {
  const todaysDelivery = state.delivery;
  return todaysDelivery &&
    todaysDelivery.stops &&
    todaysDelivery.selectedStopId &&
    todaysDelivery.stops[todaysDelivery.selectedStopId]
    ? todaysDelivery.stops[todaysDelivery.selectedStopId]
    : null;
};

export const selectedStopId = (state) => state.delivery?.selectedStopId;

export const stops = (state) => state.delivery?.stops;

export const stopCount = (state) =>
  Object.keys(state.delivery?.stops).length || 0;

export const isOptimizedRoutes = (state) => state.delivery.optimizedRoutes;
