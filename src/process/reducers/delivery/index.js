import { createActions, createReducer } from 'reduxsauce';

import I18n from 'Locales/I18n';
import NavigationService from 'Navigation/service';
import { toggle, deliveryStates as DS } from 'Helpers';
import { Point, solve as salesman } from 'Services/salesman';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    centerSelectedStop: ['sID'],
    deleteVanDamageImage: ['key', 'index'],
    driverReply: [
      'claimId',
      'comment',
      'image',
      'imageType',
      'acknowledgedClaim',
      'index'
    ],

    foregroundDeliveryActions: null,
    getCannedContent: null,
    getCustomerClaims: ['customerId', 'stopId'],
    getDriverDataFailure: null,
    getDriverReplyImage: ['driverResponses', 'claimIndex', 'stopId'],
    getForDriver: ['isRefreshData'],
    getForDriverSuccess: ['payload', 'isRefreshData'],
    getProductsOrder: null,
    getVehicleChecks: null,
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: [
      'payload',
      'deliveryDate',
      'isRefreshData'
    ],
    getRejectDeliveryReasons: null,
    incrementDeliveredStock: ['productId', 'quantity'],
    optimizeStops: ['currentLocation', 'returnPosition'],
    redirectSetSelectedClaimId: ['claimId'],
    refreshDriverData: null,
    resetChecklistPayload: ['resetType'],
    saveVehicleChecks: ['saveType'],
    setCustomerClaims: ['payload', 'stopId'],
    setDelivered: ['id', 'selectedStopId', 'outOfStockIds'],
    setDirectionsPolyline: ['payload'],
    showMustComplyWithTerms: null,
    setCannedContent: ['payload'],
    setItemOutOfStock: ['id', 'selectedStopId'],
    setMileage: ['mileage'],
    setProductsOrder: ['payload'],
    setRegistration: ['reg'],
    setRejected: [
      'id',
      'selectedStopId',
      'outOfStockIds',
      'reasonType',
      'reasonMessage'
    ],
    setSelectedClaimId: ['claim'],
    setRejectDeliveryReasons: ['payload'],
    setVanDamageComment: ['key', 'comment'],
    setVanDamageImage: ['key', 'imagePath', 'imageType'],
    setVehicleChecks: ['payload'],
    startDelivering: [],
    toggleCheckJson: ['key'],
    toggleConfirmedItem: ['id'],
    toggleOutOfStock: ['id'],
    toggleModal: ['modal', 'show'],
    updateDriverActivity: null,
    updateChecklistProps: ['props'],
    updateDirectionsPolyline: null,
    updateProps: ['props'],
    updateReturnPosition: ['clear'],
    updateSelectedStop: ['sID', 'manualRoutes']
  },
  { prefix: 'delivery/' }
);

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
  cannedContent: [],
  centerSelectedStopLocation: null,
  checklist: {
    deliveryComplete: false,
    loadedVan: false,
    shiftEndVanChecks: false,
    shiftStartVanChecks: false,
    payload: { ...initialVehicleChecks },
    payloadAltered: false
  },
  completedStopsIds: [],
  confirmedItem: [],
  deliveredStock: {},
  directionsPolyline: [],
  hasRoutes: false,
  manualRoutes: true,
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

const deleteVanDamageImage = (state, { key, index }) =>
  produce(state, draft => {
    draft.checklist.payload.vehicleCheckDamage[key].vehicleCheckDamageImage =
      draft.checklist.payload.vehicleCheckDamage[
        key
      ].vehicleCheckDamageImage.filter((image, idx) => idx !== index);
  });

const driverReply = (
  state,
  { claimId, comment, image, imageType, acknowledgedClaim, index }
) =>
  produce(state, draft => {
    const selectedStopId = state.selectedStopId;
    const response = {
      driverAcknowledged: true,
      claimId,
      comment,
      hasImage: image && imageType ? true : false,
      responseDateTime: new Date(),
      localImage: image
    };

    if (!acknowledgedClaim) {
      const unacknowledgedList =
        state.stops[selectedStopId].claims.unacknowledgedList;
      draft.stops[selectedStopId].claims.unacknowledgedList =
        unacknowledgedList.slice(1);

      draft.stops[selectedStopId].claims.acknowledgedList.push({
        ...unacknowledgedList.slice(0, 1)[0],
        driverResponses: [
          ...unacknowledgedList.slice(0, 1)[0].driverResponses,
          response
        ],
        index: state.stops[selectedStopId].claims.acknowledgedList.length + 1
      });
      draft.stops[selectedStopId].claims.showCount =
        draft.stops[selectedStopId].claims.showCount + 1;

      if (draft.stops[selectedStopId].claims.unacknowledgedList.length === 0) {
        draft.stops[selectedStopId].claims.showClaimModal = false;
        NavigationService.goBack();
      } else {
        draft.stops[selectedStopId].claims.selectedClaimId =
          unacknowledgedList.slice(1)[0].claimId;
      }
    } else {
      draft.stops[selectedStopId].claims.acknowledgedList[
        index
      ].driverResponses.push(response);

      NavigationService.goBack();
    }

    draft.stops[selectedStopId].claims.showReplyModal = false;
  });

const privateIncrementDeliveredStock = (draft, { productId, quantity }) => {
  if (!draft.deliveredStock[productId]) {
    draft.deliveredStock[productId] = 0;
  }
  draft.deliveredStock[productId] += quantity;
};

const processingTrue = state =>
  produce(state, draft => {
    draft.processing = true;
  });

const resetSelectedStopInfo = draft => {
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

const setDeliveredOrRejected = (
  state,
  requestType,
  { outOfStockIds, selectedStopId }
) =>
  produce(state, draft => {
    resetSelectedStopInfo(draft);
    draft.selectedStopId = null;
    draft.completedStopsIds.push(
      ...draft.orderedStopsIds.splice(
        draft.orderedStopsIds.indexOf(selectedStopId),
        1
      )
    );
    draft.stops[selectedStopId].status =
      requestType === 'delivered' ? 'completed' : 'rejected';
    if (requestType === 'delivered') {
      updateOrderItemsStatuses(draft, selectedStopId, outOfStockIds);
    }

    if (draft.orderedStopsIds.length === 0) {
      draft.status = DS.DELC;
      draft.checklist.deliveryComplete = true;
    }
  });

const updateOrderItemsStatuses = (draft, selectedStopId, outOfStockIds) => {
  Object.keys(draft.stops[selectedStopId].orders).map(key => {
    if (outOfStockIds.includes(key)) {
      draft.stops[selectedStopId].orders[key].status = 3;
    } else {
      draft.stops[selectedStopId].orders[key].status = 2;
    }
  });
};

export const centerSelectedStop = (state, { sID }) =>
  produce(state, draft => {
    if (sID) {
      draft.centerSelectedStopLocation = {
        latitude: draft.stops[sID].latitude,
        longitude: draft.stops[sID].longitude
      };
    } else {
      draft.centerSelectedStopLocation = null;
    }
  });

export const getVehicleStockForDriverSuccess = (
  state,
  { deliveryDate, payload }
) =>
  produce(state, draft => {
    const misplacedProducts = {};

    draft.itemCount = 0;
    draft.additionalItemCount = 0;
    draft.stock = payload;
    draft.hasRoutes = payload.length > 0;
    draft.orderedStock = [];
    for (const route of payload) {
      route.vehicleStockItems.forEach(item => {
        const formattedProduct = {
          additionalQuantity: route.isAdditionalStock ? item.quantity : 0,
          description: item.measureDescription,
          disabled: true, // items in load van should not be tappable
          key: item.productId,
          quantity: item.quantity,
          title: item.productName,
          productId: item.productId
        };

        if (draft.productsOrder.includes(item.productId)) {
          const productSortedIndex = draft.productsOrder.indexOf(
            item.productId
          );

          if (draft.orderedStock[productSortedIndex]) {
            draft.orderedStock[productSortedIndex].quantity += item.quantity;
            if (route.isAdditionalStock) {
              draft.orderedStock[productSortedIndex].additionalQuantity +=
                item.quantity;
            }
          } else {
            draft.orderedStock[productSortedIndex] = formattedProduct;
          }
        } else {
          if (misplacedProducts[item.productId]) {
            misplacedProducts[item.productId].quantity += item.quantity;
            if (route.isAdditionalStock) {
              misplacedProducts[item.productId].additionalQuantity +=
                item.quantity;
            }
          } else {
            misplacedProducts[item.productId] = formattedProduct;
          }
        }
        draft.itemCount += item.quantity;
        if (route.isAdditionalStock) {
          draft.additionalItemCount += item.quantity;
        }
      });
    }
    draft.orderedStock = draft.orderedStock.filter(product => product);

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
  produce(state, draft => {
    draft.stockWithData = payload;
    draft.stops = {};
    draft.orderedStopsIds = [];
    draft.completedStopsIds = [];
    draft.deliveredStock = {};

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
        address: {
          addressId: key,
          latitude,
          longitude,
          deliveryInstructions,
          coolBox
        }
      } = item;

      if (!draft.stops[key]) {
        const title =
          (item.address.name_number ? `${item.address.name_number}` : '') +
          (item.address.line1 ? ` ${item.address.line1}` : '') +
          (item.address.postcodeOutward
            ? `, ${item.address.postcodeOutward}`
            : '') +
          (item.address.postcodeInward ? `${item.address.postcodeInward}` : '');

        draft.stops[key] = {
          key,
          customerId: item.customerId,
          satisfactionStatus: item.satisfactionStatus || 0,
          description: I18n.t('screens:deliver.userID', {
            userId: item.userId
          }),
          deliveryInstructions:
            deliveryInstructions && deliveryInstructions.length > 0
              ? deliveryInstructions
              : null,
          hasCustomerImage: item.hasCustomerImage,
          icon: null,
          itemCount: 0,
          latitude,
          longitude,
          orderID: item.orderID,
          orders: {},
          phoneNumber: item.phoneNumber,
          status: 'completed',
          title,
          userId: item.userId,
          searchHandle: title.toLowerCase() + item.userId.toString(),
          claims: {
            acknowledgedList: [],
            unacknowledgedList: [],
            showClaimModal: false
          },
          coolBox
        };
      }

      if (draft.stops[key].status !== 'rejected') {
        if ([4, 6].includes(item.delivery_stateID)) {
          draft.stops[key].status = 'rejected';
        }
      }
      if (draft.stops[key].status !== 'pending') {
        if (item.delivery_stateID === 1) {
          draft.stops[key].status = 'pending';
        }
      }

      if (item.delivery_stateID === 1) {
        if (!draft.orderedStopsIds.includes(key)) {
          draft.orderedStopsIds.push(key);
        }
      } else {
        privateIncrementDeliveredStock(draft, item);
        if (!draft.completedStopsIds.includes(key)) {
          draft.completedStopsIds.push(key);
        }
      }

      if (!draft.stops[key].orders[item.orderItemId]) {
        draft.stops[key].orders[item.orderItemId] = {
          description: item.measureDescription,
          key: item.orderItemId,
          productId: item.productId,
          quantity: item.quantity,
          status: item.delivery_stateID,
          title: item.productName
        };
      } else if (draft.stops[key].orders[item.orderItemId].status === 1) {
        draft.stops[key].orders[item.orderItemId].status =
          item.delivery_stateID;
      }

      draft.stops[key].searchHandle += ` ${item.productName.toLowerCase()}`;

      draft.stops[key].itemCount += item.quantity;
    }
  });

export const incrementDeliveredStock = (state, { productId, quantity }) =>
  produce(state, draft => {
    privateIncrementDeliveredStock(draft, { productId, quantity });
  });

export const optimizeStops = (state, { currentLocation, returnPosition }) =>
  produce(state, draft => {
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
    optimizedRoute.map(i => draft.orderedStopsIds.push(stops[i].key));
    draft.selectedStopId = draft.orderedStopsIds[0];

    draft.status = DS.DEL;
    draft.manualRoutes = false;
    draft.processing = false;
  });

export const reset = () => initialState;

export const resetChecklistPayload = (state, { resetType }) =>
  produce(state, draft =>
    updateChecklistProps(state, {
      props: {
        payloadAltered: resetType ? true : false,
        payload: {
          ...initialVehicleChecks,
          ...(resetType === 'shiftEnd' && { shiftEnd: true }),
          ...(resetType === 'shiftStart' && { shiftStart: true }),
          checksJson: { ...draft.checksJson }
        }
      }
    })
  );

export const saveVehicleChecks = (state, { saveType }) =>
  produce(state, draft => {
    draft.checklist[saveType] = true;
    if (saveType === 'shiftEndVanChecks') {
      draft.status = DS.SC;
    }
  });

export const setCannedContent = (state, { payload }) =>
  produce(state, draft => {
    draft.cannedContent = payload;
  });

export const setCustomerClaims = (state, { payload, stopId }) =>
  produce(state, draft => {
    const unacknowledgedList = [];
    const acknowledgedList = [];

    payload.forEach(claim => {
      if (claim.driverAcknowledged === false) {
        unacknowledgedList.push(claim);
        draft.stops[stopId].claims.showClaimModal = true;
      } else {
        acknowledgedList.push({ ...claim, index: acknowledgedList.length + 1 });
      }
    });

    if (unacknowledgedList.length > 0) {
      draft.stops[stopId].claims.showCount = 1;
      draft.stops[stopId].claims.selectedClaimId =
        unacknowledgedList[0].claimId;
      draft.stops[stopId].claims.unacknowledgedListNr =
        unacknowledgedList.length;
    }
    draft.stops[stopId].claims.acknowledgedList = acknowledgedList;
    draft.stops[stopId].claims.unacknowledgedList = unacknowledgedList;
  });

export const setDelivered = (state, params) =>
  setDeliveredOrRejected(state, 'delivered', params);

export const setItemOutOfStock = (state, { id, selectedStopId }) =>
  produce(state, draft => {
    draft.stops[selectedStopId].orders[id].status = 3;
  });

export const setMileage = (state, { mileage }) =>
  produce(state, draft => {
    draft.checklist.payload.currentMileage = mileage;
  });

export const setRegistration = (state, { reg }) =>
  produce(state, draft => {
    draft.checklist.payload.vehicleRegistration = reg;
  });

export const setRejected = (state, params) =>
  setDeliveredOrRejected(state, 'rejected', params);

export const setProductsOrder = (state, { payload }) =>
  produce(state, draft => {
    draft.productsOrder = payload;
  });

export const setRejectDeliveryReasons = (state, { payload }) =>
  produce(state, draft => {
    draft.rejectReasons = payload;
  });

export const setVanDamageComment = (state, { key, comment }) =>
  produce(state, draft => {
    if (!draft.checklist.payload.vehicleCheckDamage[key]) {
      resetVanDamage(draft, key);
    }

    draft.checklist.payload.vehicleCheckDamage[key].comments = comment;
  });

export const setVanDamageImage = (state, { key, imagePath, imageType }) =>
  produce(state, draft => {
    if (!draft.checklist.payload.vehicleCheckDamage[key]) {
      resetVanDamage(draft, key);
    }

    const images = [
      ...draft.checklist.payload.vehicleCheckDamage[key].vehicleCheckDamageImage
    ];

    images.push({
      imagePath,
      imageType
    });

    draft.checklist.payload.vehicleCheckDamage[key].vehicleCheckDamageImage =
      images;
  });

export const setSelectedClaimId = (state, { claimId }) =>
  produce(state, draft => {
    const selectedStopId = draft.selectedStopId;
    draft.stops[selectedStopId].claims.selectedClaimId = claimId;
  });

export const setVehicleChecks = (state, { payload }) =>
  produce(state, draft => {
    draft.checksJson = payload;
  });

export const startDelivering = state =>
  produce(state, draft => {
    draft.status = DS.DEL;
    if (state.manualRoutes) {
      draft.processing = false;
    } else {
      draft.processing = true;
    }
  });

export const toggleCheckJson = (state, { key }) =>
  produce(state, draft => {
    draft.checklist.payload.checksJson[key] =
      !draft.checklist.payload.checksJson[key];
  });

export const toggleConfirmedItem = (state, { id }) =>
  produce(state, draft => {
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
  produce(state, draft => {
    draft.outOfStockIds = toggle(state.outOfStockIds, id);
    const idx = state.confirmedItem.indexOf(id);
    if (idx > -1) {
      draft.confirmedItem.splice(idx, 1);
    }
    draft.allItemsDone =
      draft.confirmedItem.length + draft.outOfStockIds.length ===
      Object.keys(state.stops[state.selectedStopId]?.orders).length;
  });

export const toggleModal = (state, { modal, show }) =>
  produce(state, draft => {
    draft.stops[draft.selectedStopId].claims[modal] = show;
  });

export const updateChecklistProps = (state, { props }) =>
  updateProps(state, {
    props: { checklist: { ...state.checklist, ...props } }
  });

export const setDirectionsPolyline = (state, { payload }) =>
  produce(state, draft => {
    draft.directionsPolyline = payload;
  });

export const updateSelectedStop = (state, { sID, manualRoutes = true }) =>
  produce(state, draft => {
    resetSelectedStopInfo(draft);
    draft.manualRoutes = manualRoutes;
    draft.previousStopId = draft.selectedStopId;
    draft.processing = false;
    draft.selectedStopId = sID;
    if (sID) {
      draft.stops[sID].claims.showReplyModal = false;
    }
  });

export default createReducer(initialState, {
  [Types.CENTER_SELECTED_STOP]: centerSelectedStop,
  [Types.DELETE_VAN_DAMAGE_IMAGE]: deleteVanDamageImage,
  [Types.DRIVER_REPLY]: driverReply,
  [Types.GET_FOR_DRIVER]: processingTrue,
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS]: getVehicleStockForDriverSuccess,
  [Types.INCREMENT_DELIVERED_STOCK]: incrementDeliveredStock,
  [Types.OPTIMIZE_STOPS]: optimizeStops,
  [Types.REDIRECT_SET_SELECTED_CLAIM_ID]: setSelectedClaimId,
  [Types.RESET_CHECKLIST_PAYLOAD]: resetChecklistPayload,
  [Types.SAVE_VEHICLE_CHECKS]: saveVehicleChecks,
  [Types.SET_CANNED_CONTENT]: setCannedContent,
  [Types.SET_CUSTOMER_CLAIMS]: setCustomerClaims,
  [Types.SET_DELIVERED]: setDelivered,
  [Types.SET_DIRECTIONS_POLYLINE]: setDirectionsPolyline,
  [Types.SET_ITEM_OUT_OF_STOCK]: setItemOutOfStock,
  [Types.SET_MILEAGE]: setMileage,
  [Types.SET_PRODUCTS_ORDER]: setProductsOrder,
  [Types.SET_REGISTRATION]: setRegistration,
  [Types.SET_REJECT_DELIVERY_REASONS]: setRejectDeliveryReasons,
  [Types.SET_REJECTED]: setRejected,
  [Types.SET_SELECTED_CLAIM_ID]: setSelectedClaimId,
  [Types.SET_VAN_DAMAGE_COMMENT]: setVanDamageComment,
  [Types.SET_VAN_DAMAGE_IMAGE]: setVanDamageImage,
  [Types.SET_VEHICLE_CHECKS]: setVehicleChecks,
  [Types.START_DELIVERING]: startDelivering,
  [Types.TOGGLE_CHECK_JSON]: toggleCheckJson,
  [Types.TOGGLE_CONFIRMED_ITEM]: toggleConfirmedItem,
  [Types.TOGGLE_OUT_OF_STOCK]: toggleOutOfStock,
  [Types.TOGGLE_MODAL]: toggleModal,
  [Types.UPDATE_CHECKLIST_PROPS]: updateChecklistProps,
  [Types.UPDATE_PROPS]: updateProps,
  [Types.UPDATE_SELECTED_STOP]: updateSelectedStop
});

export const additionalItemCount = state => state.delivery?.additionalItemCount;

export const checklist = state => state.delivery?.checklist;

export const directionsPolyline = state => state.delivery?.directionsPolyline;

export const completedStopsIds = state => state.delivery?.completedStopsIds;

export const itemCount = state => state.delivery?.itemCount || 0;

export const orderedStopsIds = state => state.delivery?.orderedStopsIds;

export const selectedStop = state => {
  const todaysDelivery = state.delivery;
  return todaysDelivery &&
    todaysDelivery.stops &&
    todaysDelivery.selectedStopId &&
    todaysDelivery.stops[todaysDelivery.selectedStopId]
    ? todaysDelivery.stops[todaysDelivery.selectedStopId]
    : null;
};

export const selectedStopId = state => state.delivery?.selectedStopId;

export const status = state => state.delivery?.status;

export const stops = state => state.delivery?.stops;

export const stopCount = state =>
  Object.keys(state.delivery?.stops).length || 0;

export const manualRoutes = state => state.delivery.manualRoutes;
