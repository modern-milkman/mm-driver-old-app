import Config from 'react-native-config';
import { createActions, createReducer } from 'reduxsauce';

import I18n from 'Locales/I18n';
import NavigationService from 'Navigation/service';
import { toggle, deliveryStates as DS } from 'Helpers';
import { Point, solve as salesman } from 'Services/salesman';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    acknowledgeClaim: ['id', 'selectedStopId'],
    acknowledgeClaimFailure: null,
    acknowledgeClaimSuccess: ['payload', 'selectedStopId'],
    deleteVanDamageImage: ['key', 'index'],
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
    resetChecklistPayload: ['resetType'],
    saveVehicleChecks: ['saveType'],
    saveVehicleChecksFailure: null,
    saveVehicleChecksSuccess: ['payload', 'saveType'],
    showMustComplyWithTerms: null,
    setCustomerClaims: ['payload', 'selectedStopId'],
    setDelivered: ['id'],
    setDeliveredOrRejectedFailure: null,
    setDeliveredOrRejectedSuccess: null,
    setDriverReplyImage: [
      'payload',
      'claimIndex',
      'driverResponseIndex',
      'selectedStopId'
    ],
    setItemOutOfStock: ['id'],
    setMileage: ['mileage'],
    setProductsOrder: ['payload'],
    setRegistration: ['reg'],
    setRejected: ['id', 'reasonMessage'],
    setSelectedClaim: ['claim'],
    setSelectedStopImage: ['payload', 'props'],
    setVanDamageComment: ['key', 'comment'],
    setVanDamageImage: ['key', 'image', 'imageType'],
    startDelivering: [],
    toggleCheckJson: ['key'],
    toggleConfirmedItem: ['id'],
    toggleOutOfStock: ['id'],
    toggleReplyModal: ['show'],
    updateChecklistProps: ['props'],
    updateDirectionsPolyline: ['payload'],
    updateDriverResponse: ['data'],
    updateProps: ['props'],
    updateReturnPosition: ['clear'],
    updateSelectedStop: ['sID']
  },
  { prefix: 'delivery/' }
);

const productImageUri = `${Config.SERVER_URL}${Config.SERVER_URL_BASE}/Product/Image/`;
const initialClaim = {
  driverResponse: { text: null, image: null, imageType: null },
  driverUnacknowledgedNr: 0,
  list: [],
  selectedClaim: null
};
const initialVehicleChecks = {
  shiftStart: false,
  shiftEnd: false,
  vehicleRegistration: '',
  currentMileage: '',
  checksJson: '',
  vehicleCheckDamage: {}
};

const initialState = {
  allItemsDone: false,
  checklist: {
    deliveryComplete: false,
    loadedVan: false,
    shiftEndVanChecks: false,
    shiftStartVanChecks: false,
    payload: { ...initialVehicleChecks },
    payloadAltered: false
  },
  checksJson: {
    Odometer: false,
    Keys: false,
    Brakes: false,
    'Horn and steering': false,
    Lights: false,
    'Mirrors & glass': false,
    'Seats & seat belts': false,
    'Washers and wipers': false,
    'Warning lights': false,
    'No smoking sign': false,
    'Maximum height sticker': false,
    Battery: false,
    'Fluid levels, leaks, filler caps': false,
    'Bodywork and doors': false,
    Exhaust: false,
    'Tyres and wheels': false,
    'Load security / Internal damage': false,
    'Interior clean': false,
    'Exterior clean': false,
    'Audible warning devices': false
  },
  claims: { showClaimModal: false, showReplyModal: false, processing: false },
  completedStopsIds: [],
  confirmedItem: [],
  directionsPolyline: [],
  hasRoutes: false,
  optimizedRoutes: false,
  orderedStock: [],
  orderedStopsIds: [],
  outOfStockIds: [],
  previousStopId: null,
  processing: true,
  selectedStopId: null,
  status: DS.NCI,
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

const deleteVanDamageImage = (state, { key, index }) =>
  produce(state, (draft) => {
    draft.checklist.payload.vehicleCheckDamage[
      key
    ].vehicleCheckDamageImage = draft.checklist.payload.vehicleCheckDamage[
      key
    ].vehicleCheckDamageImage.filter((image, idx) => idx !== index);
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

const processingFalse = (state) =>
  produce(state, (draft) => {
    draft.processing = false;
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

const resetVanDamage = (draft, key) => {
  return (draft.checklist.payload.vehicleCheckDamage[key] = {
    vehicleCheckDamageImage: [],
    comments: ''
  });
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
    draft.processing = false;
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

    /*
    BE delivery_stateID values
    Pending = 1,
    Delivered = 2,
    OutOfStock = 3,
    Rejected = 4,
    Cancelled = 5,
    RejectedRefunded = 6
    */

    let hasNonPendingOrders = false;
    let markedOrders = 0;
    for (const item of draft.stockWithData.items) {
      if (item.delivery_stateID !== 1) {
        hasNonPendingOrders = true;
        markedOrders++;
      }
    }

    if (!isRefreshData) {
      if (markedOrders === draft.stockWithData.items.length) {
        draft.status = DS.DELC;
        draft.checklist.deliveryComplete = true;
        draft.checklist.shiftStartVanChecks = true;
        draft.checklist.loadedVan = true;
      } else if (hasNonPendingOrders) {
        draft.status = DS.DEL;
        draft.checklist.shiftStartVanChecks = true;
        draft.checklist.loadedVan = true;
      }
    } else if (markedOrders === draft.stockWithData.items.length) {
      draft.checklist.deliveryComplete = true;
      draft.status = DS.DELC;
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

    draft.status = DS.DEL;
    draft.optimizedRoutes = true;
    draft.processing = false;
  });

export const reset = () => initialState;

export const resetChecklistPayload = (state, { resetType }) =>
  produce(state, (draft) =>
    updateChecklistProps(state, {
      props: {
        payloadAltered: true,
        payload: {
          ...initialVehicleChecks,
          ...(resetType === 'shiftEnd' && { shiftEnd: true }),
          ...(resetType === 'shiftStart' && { shiftStart: true }),
          checksJson: { ...draft.checksJson }
        }
      }
    })
  );

export const saveVehicleChecksSuccess = (state, { payload, saveType }) =>
  produce(state, (draft) => {
    draft.checklist[saveType] = true;
    if (saveType === 'shiftEndVanChecks') {
      draft.status = DS.SC;
    }
    draft.processing = false;
  });

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

export const setDeliveredOrRejectedSuccess = (state) =>
  produce(state, (draft) => {
    draft.completedStopsIds.push(
      ...draft.orderedStopsIds.splice(
        draft.orderedStopsIds.indexOf(draft.selectedStopId),
        1
      )
    );
    resetSelectedStopInfo(draft);
    draft.stops[draft.selectedStopId].status = 'completed';

    if (draft.orderedStopsIds.length > 0) {
      draft.selectedStopId = draft.orderedStopsIds[0];
      if (!draft.optimizedRoutes) {
        draft.selectedStopId = null;
      }
    } else {
      draft.selectedStopId = null;
      draft.status = DS.DELC;
      draft.checklist.deliveryComplete = true;
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

export const setMileage = (state, { mileage }) =>
  produce(state, (draft) => {
    draft.checklist.payload.currentMileage = mileage;
  });

export const setRegistration = (state, { reg }) =>
  produce(state, (draft) => {
    draft.checklist.payload.vehicleRegistration = reg;
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

export const setVanDamageComment = (state, { key, comment }) =>
  produce(state, (draft) => {
    if (!draft.checklist.payload.vehicleCheckDamage[key]) {
      resetVanDamage(draft, key);
    }

    draft.checklist.payload.vehicleCheckDamage[key].comments = comment;
  });

export const setVanDamageImage = (state, { key, image, imageType }) =>
  produce(state, (draft) => {
    if (!draft.checklist.payload.vehicleCheckDamage[key]) {
      resetVanDamage(draft, key);
    }

    const images = [
      ...draft.checklist.payload.vehicleCheckDamage[key].vehicleCheckDamageImage
    ];

    images.push({
      image,
      imageType
    });

    draft.checklist.payload.vehicleCheckDamage[
      key
    ].vehicleCheckDamageImage = images;
  });

export const setSelectedClaim = (state, { claim }) =>
  produce(state, (draft) => {
    const selectedStopId = draft.selectedStopId;
    draft.claims[selectedStopId].selectedClaim = claim;
  });

export const startDelivering = (state) =>
  produce(state, (draft) => {
    if (!state.optimizedRoutes) {
      draft.status = DS.DEL;
      draft.processing = false;
    } else {
      draft.processing = true;
    }
  });

export const toggleCheckJson = (state, { key }) =>
  produce(state, (draft) => {
    draft.checklist.payload.checksJson[key] = !draft.checklist.payload
      .checksJson[key];
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

export const updateChecklistProps = (state, { props }) =>
  updateProps(state, {
    props: { checklist: { ...state.checklist, ...props } }
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
    draft.optimizedRoutes = false;
    draft.previousStopId = draft.selectedStopId;
    draft.selectedStopId = sID;
    draft.claims.showClaimModal = false;
    draft.claims.showReplyModal = false;
  });

export default createReducer(initialState, {
  [Types.ACKNOWLEDGE_CLAIM]: claimProcessing,
  [Types.ACKNOWLEDGE_CLAIM_FAILURE]: claimFinishedProcessing,
  [Types.ACKNOWLEDGE_CLAIM_SUCCESS]: acknowledgeClaimSuccess,
  [Types.DELETE_VAN_DAMAGE_IMAGE]: deleteVanDamageImage,
  [Types.DRIVER_REPLY]: claimProcessing,
  [Types.DRIVER_REPLY_FAILURE]: claimFinishedProcessing,
  [Types.DRIVER_REPLY_SUCCESS]: driverReplySuccess,
  [Types.GET_DRIVER_REPLY_SINGLE_IMAGE_SUCCESS]: getDriverReplySingleImageSuccess,
  [Types.GET_FOR_DRIVER]: processingTrue,
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS]: getVehicleStockForDriverSuccess,
  [Types.OPTIMIZE_STOPS]: optimizeStops,
  [Types.REDIRECT_SET_SELECTED_CLAIM]: setSelectedClaim,
  [Types.RESET_CHECKLIST_PAYLOAD]: resetChecklistPayload,
  [Types.SAVE_VEHICLE_CHECKS]: processingTrue,
  [Types.SAVE_VEHICLE_CHECKS_FAILURE]: processingFalse,
  [Types.SAVE_VEHICLE_CHECKS_SUCCESS]: saveVehicleChecksSuccess,
  [Types.SET_CUSTOMER_CLAIMS]: setCustomerClaims,
  [Types.SET_DELIVERED_OR_REJECTED_FAILURE]: setDeliveredOrRejectedFailure,
  [Types.SET_DELIVERED_OR_REJECTED_SUCCESS]: setDeliveredOrRejectedSuccess,
  [Types.SET_DELIVERED]: processingTrue,
  [Types.SET_DRIVER_REPLY_IMAGE]: setDriverReplyImage,
  [Types.SET_MILEAGE]: setMileage,
  [Types.SET_PRODUCTS_ORDER]: setProductsOrder,
  [Types.SET_REGISTRATION]: setRegistration,
  [Types.SET_REJECTED]: processingTrue,
  [Types.SET_SELECTED_CLAIM]: setSelectedClaim,
  [Types.SET_SELECTED_STOP_IMAGE]: setSelectedStopImage,
  [Types.SET_VAN_DAMAGE_COMMENT]: setVanDamageComment,
  [Types.SET_VAN_DAMAGE_IMAGE]: setVanDamageImage,
  [Types.START_DELIVERING]: startDelivering,
  [Types.TOGGLE_CHECK_JSON]: toggleCheckJson,
  [Types.TOGGLE_CONFIRMED_ITEM]: toggleConfirmedItem,
  [Types.TOGGLE_OUT_OF_STOCK]: toggleOutOfStock,
  [Types.TOGGLE_REPLY_MODAL]: toggleReplyModal,
  [Types.UPDATE_CHECKLIST_PROPS]: updateChecklistProps,
  [Types.UPDATE_DIRECTIONS_POLYLINE]: updateDirectionsPolyline,
  [Types.UPDATE_DRIVER_RESPONSE]: updateDriverResponse,
  [Types.UPDATE_PROPS]: updateProps,
  [Types.UPDATE_SELECTED_STOP]: updateSelectedStop
});

export const checklist = (state) => state.delivery?.checklist;

export const claims = (state) => state.delivery?.claims;

export const completedStopsIds = (state) => state.delivery?.completedStopsIds;

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

export const status = (state) => state.delivery?.status;

export const stops = (state) => state.delivery?.stops;

export const stopCount = (state) =>
  Object.keys(state.delivery?.stops).length || 0;

export const isOptimizedRoutes = (state) => state.delivery.optimizedRoutes;
