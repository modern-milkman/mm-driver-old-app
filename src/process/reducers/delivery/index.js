import Config from 'react-native-config';
import { createActions, createReducer } from 'reduxsauce';

import I18n from 'Locales/I18n';
import { Point, solve as salesman } from 'Services/salesman';
import {
  checkAtLeastOneItem,
  currentDay as cDay,
  formatDate,
  toggle
} from 'Helpers';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    acknowledgeClaim: ['id'],
    acknowledgeClaimSuccess: ['payload'],
    driverReply: ['claimId', 'comment', 'image', 'imageType'],
    driverReplySuccess: ['payload'],
    getCustomerClaims: ['customerId'],
    getForDriver: ['isRefreshData'],
    getForDriverSuccess: ['payload', 'isRefreshData'],
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: [
      'payload',
      'deliveryDate',
      'isRefreshData'
    ],
    optimizeStops: ['currentLocation', 'returnPosition'],
    setCurrentDay: null,
    setCustomerClaims: ['payload'],
    setDelivered: ['id'],
    setDeliveredOrRejectedFailure: null,
    setDeliveredOrRejectedSuccess: null,
    toggleReplyModal: ['cId', 'show'],
    setItemOutOfStock: ['id'],
    setRejected: ['id', 'reasonMessage'],
    setSelectedStopImage: ['payload', 'props'],
    refreshDriverData: null,
    startDelivering: [],
    toggleConfirmedItem: ['id'],
    toggleOutOfStock: ['id'],
    updateCurrentDayProps: ['props'],
    updateDirectionsPolyline: ['payload'],
    updateDriverResponse: ['text', 'image', 'imageType'],
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
const initialCurrentDay = cDay();
const initialClaim = {
  driverResponse: { text: null, image: null, imageType: null },
  list: [],
  showClaimModal: false,
  driverUnacknowledgedNr: 0,
  showReplyModal: false
};

const initialCurrentDayState = {
  allItemsDone: false,
  claims: { ...initialClaim },
  completedStopsIds: [],
  confirmedItem: [],
  deliveryStatus: 0,
  directionsPolyline: [],
  groupedStock: {},
  hasRoutes: false,
  orderedStopsIds: [],
  previousStopId: null,
  outOfStockIds: [],
  selectedStopId: null,
  stock: [],
  stockWithData: {},
  stops: {}
};

const initialState = {
  currentDay: initialCurrentDay,
  optimizedRoutes: false,
  processing: true,
  [initialCurrentDay]: initialCurrentDayState
};

const acknowledgeClaimSuccess = (state, { payload }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].claims.list = draft[cd].claims.list.map((item) => {
      if (item.claimId === payload.claimId) {
        return payload;
      }
      return item;
    });

    const driverUnacknowledgedList = draft[cd].claims.list.filter(
      (item) => item.driverAcknowledged === false
    );

    if (driverUnacknowledgedList.length > 0) {
      draft[cd].claims.selectedId = driverUnacknowledgedList[0].claimId;
      draft[cd].claims.showedUnacknowledgedNr += 1;
    } else {
      draft[cd].claims.showClaimModal = false;
    }
  });

const driverReplySuccess = (state, { payload }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].claims.list = draft[cd].claims.list.map((item) => {
      if (item.claimId === payload.claimId) {
        item.driverResponses.push(payload);
      }
      return item;
    });

    draft[cd].claims.showReplyModal = false;
    draft[cd].claims.driverResponse = {
      text: null,
      image: null,
      imageType: null
    };
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

export const reset = () => initialState;

export const setCustomerClaims = (state, { payload }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].claims.list = payload;
    const driverUnacknowledgedList = payload.filter(
      (item) => item.driverAcknowledged === false
    );

    const driverUnacknowledgedLength = driverUnacknowledgedList.length;

    if (driverUnacknowledgedLength > 0) {
      draft[cd].claims.selectedId = driverUnacknowledgedList[0].claimId;
      draft[cd].claims.driverUnacknowledgedNr = driverUnacknowledgedLength;
      draft[cd].claims.showClaimModal = true;
      draft[cd].claims.showedUnacknowledgedNr = 1;
    }
  });

export const getVehicleStockForDriverSuccess = (
  state,
  { deliveryDate, payload }
) =>
  produce(state, (draft) => {
    const formatedDate = formatDate(new Date(deliveryDate));
    const categoryIndexes = {};
    const categoryProductsIndexes = {};
    draft[formatedDate].itemCount = 0;
    const groupedItems = payload.reduce((categoryGroupedProducts, route) => {
      route.vehicleStockItems.forEach((item) => {
        const catDescription = item.categoryDescription;

        if (categoryIndexes[catDescription] !== undefined) {
          const categoryProducts =
            categoryGroupedProducts[categoryIndexes[catDescription]];
          const prodIndex =
            categoryProductsIndexes[catDescription][item.productName];

          if (prodIndex !== undefined) {
            categoryProducts.data[prodIndex].miscelaneousLarge += item.quantity;
            draft[formatedDate].itemCount += item.quantity;
          } else {
            categoryProducts.data.push({
              description: item.measureDescription,
              disabled: true, // items in load van should not be tappable
              image: `${productImageUri}${item.productId}`,
              key: item.productId,
              miscelaneousLarge: item.quantity,
              title: item.productName
            });
            categoryProductsIndexes[catDescription][item.productName] =
              categoryProducts.data.length - 1;
            draft[formatedDate].itemCount += item.quantity;
          }
        } else {
          categoryGroupedProducts.push({
            title: catDescription,
            data: [
              {
                description: item.measureDescription,
                disabled: true, // items in load van should not be tappable
                image: `${productImageUri}${item.productId}`,
                key: item.productId,
                miscelaneousLarge: item.quantity,
                title: item.productName
              }
            ]
          });
          categoryIndexes[catDescription] = categoryGroupedProducts.length - 1;
          categoryProductsIndexes[catDescription] = {};
          categoryProductsIndexes[catDescription][item.productName] = 0;
          draft[formatedDate].itemCount += item.quantity;
        }
      });

      return categoryGroupedProducts;
    }, []);

    draft[formatedDate].stock = payload;
    draft[formatedDate].groupedStock = groupedItems;
    draft[formatedDate].hasRoutes = payload.length > 0;
  });

export const getForDriverSuccess = (
  state,
  { payload, props: { isRefreshData = false } }
) =>
  produce(state, (draft) => {
    const cd = formatDate(new Date(payload.deliveryDate));

    draft[cd].stockWithData = payload;
    const deliveryStatus = checkAtLeastOneItem(payload?.items, 1, true)
      ? checkAtLeastOneItem(payload?.items, 1)
        ? 2
        : 3
      : 0;

    if (!isRefreshData || deliveryStatus === 3) {
      draft[cd].deliveryStatus = deliveryStatus;
    }

    // PREPARE RAW STOPS
    for (const item of draft[cd].stockWithData.items) {
      const {
        address: { addressId: key, latitude, longitude, deliveryInstructions }
      } = item;

      if (!draft[cd].stops[key]) {
        if (item.delivery_stateID === 1) {
          draft[cd].orderedStopsIds.push(key);
        } else {
          draft[cd].completedStopsIds.push(key);
        }

        draft[cd].stops[key] = {
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
          latitude,
          longitude,
          orderID: item.orderID,
          orders: {},
          phoneNumber: item.phoneNumber,
          status: item.delivery_stateID === 1 ? 'pending' : 'completed',
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

      draft[cd].stops[key].orders[item.orderItemId] = {
        description: item.measureDescription,
        image: `${productImageUri}${item.productId}`,
        key: item.orderItemId,
        miscelaneousLarge: item.quantity,
        title: item.productName
      };

      draft[cd].stops[key].itemCount =
        (draft[cd].stops[key]?.itemCount ? draft[cd].stops[key].itemCount : 0) +
        item.quantity;
    }
  });

export const setDeliveredOrRejectedFailure = (state) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    resetSelectedStopInfo(draft[cd]);
    draft.processing = false;
  });

export const setDeliveredOrRejectedSuccess = (state) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].completedStopsIds.push(
      ...draft[cd].orderedStopsIds.splice(
        draft[cd].orderedStopsIds.indexOf(draft[cd].selectedStopId),
        1
      )
    );
    resetSelectedStopInfo(draft[cd]);
    draft[cd].stops[draft[cd].selectedStopId].status = 'completed';

    if (draft[cd].orderedStopsIds.length > 0) {
      draft[cd].selectedStopId = draft[cd].orderedStopsIds[0];
      if (!draft.optimizedRoutes) {
        draft[cd].selectedStopId = null;
      }
    } else {
      draft[cd].selectedStopId = null;
      draft[cd].deliveryStatus = 3;
    }
    draft.processing = false;
  });

export const setSelectedStopImage = (
  state,
  { payload: { base64Image }, props: { key } }
) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].stops[key].customerAddressImage = base64Image;
  });

export const startDelivering = (state) =>
  produce(state, (draft) => {
    if (!state.optimizedRoutes) {
      const cd = state.currentDay;

      draft[cd].deliveryStatus = 2;
      draft.processing = false;
    } else {
      draft.processing = true;
    }
  });

export const toggleConfirmedItem = (state, { id }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].confirmedItem = toggle(state[cd].confirmedItem, id);

    const idx = state[cd].outOfStockIds.indexOf(id);
    if (idx > -1) {
      draft[cd].outOfStockIds.splice(idx, 1);
    }
    // TODO reuse code from toggleConfirmedItem / toggleOutOfStock as one
    draft[cd].allItemsDone =
      draft[cd].confirmedItem.length + draft[cd].outOfStockIds.length ===
      Object.keys(state[cd].stops[state[cd].selectedStopId]?.orders).length;
  });

export const toggleOutOfStock = (state, { id }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].outOfStockIds = toggle(state[cd].outOfStockIds, id);
    const idx = state[cd].confirmedItem.indexOf(id);
    if (idx > -1) {
      draft[cd].confirmedItem.splice(idx, 1);
    }
    draft[cd].allItemsDone =
      draft[cd].confirmedItem.length + draft[cd].outOfStockIds.length ===
      Object.keys(state[cd].stops[state[cd].selectedStopId]?.orders).length;
  });

export const toggleReplyModal = (state, { cId, show }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].claims.showReplyModal = show;

    if (cId) {
      draft[cd].claims.selectedId = cId;
    }
  });

export const optimizeStops = (state, { currentLocation, returnPosition }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
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

    for (const key of draft[cd].orderedStopsIds) {
      const item = draft[cd].stops[key];
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
    draft[cd].orderedStopsIds = [];
    optimizedRoute.map((i) => draft[cd].orderedStopsIds.push(stops[i].key));
    draft[cd].selectedStopId = draft[cd].orderedStopsIds[0];
    draft[cd].deliveryStatus = 2;
    draft.optimizedRoutes = true;
    draft.processing = false;
  });

export const refreshDriverData = (state) => {
  const cd = state.currentDay;
  return {
    ...state,
    [cd]: {
      ...state[cd],
      completedStopsIds: [],
      confirmedItem: [],
      groupedStock: {},
      orderedStopsIds: [],
      outOfStockIds: [],
      stock: [],
      stockWithData: {},
      stops: {}
    }
  };
};

export const updateCurrentDayProps = (state, { props }) => {
  const cd = state.currentDay;
  return { ...state, [cd]: { ...state[cd], ...props } };
};

export const updateDirectionsPolyline = (state, { payload }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft[cd].directionsPolyline = payload;
  });

export const updateDriverResponse = (state, { text, image, imageType }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    if (typeof text === 'string') {
      draft[cd].claims.driverResponse.text = text;
    }
    if (typeof image === 'string') {
      draft[cd].claims.driverResponse.image = image;
      draft[cd].claims.driverResponse.imageType = imageType;
    }
  });

export const updateSelectedStop = (state, { sID }) =>
  produce(state, (draft) => {
    const cd = state.currentDay;
    draft.optimizedRoutes = false;
    resetSelectedStopInfo(draft[cd]);
    draft[cd].previousStopId = draft[cd].selectedStopId;
    draft[cd].selectedStopId = sID;
    draft[cd].claims = { ...initialClaim };
  });

export default createReducer(initialState, {
  [Types.ACKNOWLEDGE_CLAIM_SUCCESS]: acknowledgeClaimSuccess,
  [Types.DRIVER_REPLY_SUCCESS]: driverReplySuccess,
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_FOR_DRIVER]: processingTrue,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS]: getVehicleStockForDriverSuccess,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER]: processingTrue,
  [Types.OPTIMIZE_STOPS]: optimizeStops,
  [Types.REFRESH_DRIVER_DATA]: refreshDriverData,
  [Types.SET_CUSTOMER_CLAIMS]: setCustomerClaims,
  [Types.SET_DELIVERED_OR_REJECTED_FAILURE]: setDeliveredOrRejectedFailure,
  [Types.SET_DELIVERED_OR_REJECTED_SUCCESS]: setDeliveredOrRejectedSuccess,
  [Types.SET_DELIVERED]: processingTrue,
  [Types.SET_REJECTED]: processingTrue,
  [Types.SET_SELECTED_STOP_IMAGE]: setSelectedStopImage,
  [Types.START_DELIVERING]: startDelivering,
  [Types.TOGGLE_CONFIRMED_ITEM]: toggleConfirmedItem,
  [Types.TOGGLE_OUT_OF_STOCK]: toggleOutOfStock,
  [Types.TOGGLE_REPLY_MODAL]: toggleReplyModal,
  [Types.UPDATE_CURRENT_DAY_PROPS]: updateCurrentDayProps,
  [Types.UPDATE_DIRECTIONS_POLYLINE]: updateDirectionsPolyline,
  [Types.UPDATE_DRIVER_RESPONSE]: updateDriverResponse,
  [Types.UPDATE_PROPS]: updateProps,
  [Types.UPDATE_SELECTED_STOP]: updateSelectedStop
});

export const completedStopsIds = (state) =>
  state.delivery[state.delivery.currentDay]?.completedStopsIds;

export const deliveryStatus = (state) =>
  state.delivery[state.delivery.currentDay]?.deliveryStatus;

export const hasItemsLeftToDeliver = (state) => {
  return checkAtLeastOneItem(
    state.delivery[state.delivery.currentDay]?.stockWithData?.items
  );
};

export const itemCount = (state) =>
  state.delivery[state.delivery.currentDay]?.itemCount || 0;

export const outOfStockItems = (state) =>
  state.delivery[state.delivery.currentDay]?.outOfStockIds;

export const orderedStopsIds = (state) =>
  state.delivery[state.delivery.currentDay]?.orderedStopsIds;

export const selectedStop = (state) => {
  const todaysDelivery = state.delivery[state.delivery.currentDay];
  return todaysDelivery &&
    todaysDelivery.stops &&
    todaysDelivery.selectedStopId &&
    todaysDelivery.stops[todaysDelivery.selectedStopId]
    ? todaysDelivery.stops[todaysDelivery.selectedStopId]
    : null;
};

export const stops = (state) =>
  state.delivery[state.delivery.currentDay]?.stops;

export const stopCount = (state) =>
  Object.keys(state.delivery[state.delivery.currentDay]?.stops).length || 0;

export const isOptimizedRoutes = (state) => state.delivery.optimizedRoutes;
