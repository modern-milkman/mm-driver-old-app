import { createActions, createReducer } from 'reduxsauce';

import I18n from 'Locales/I18n';
import { toggle, deliveryStates as DS } from 'Helpers';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    clearCenterMapLocation: null,
    continueDelivering: null,
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
    getBundleProducts: null,
    getCannedContent: null,
    getCustomerClaims: ['customerId', 'stopId'],
    getDriverDataFailure: null,
    getDriverReplyImage: ['driverResponses', 'claimIndex', 'stopId'],
    getForDriver: null,
    getForDriverSuccess: ['payload'],
    getProductsOrder: null,
    getVehicleChecks: null,
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: ['payload', 'deliveryDate'],
    getRejectDeliveryReasons: null,
    initChecklist: null,
    redirectSetSelectedClaimId: ['claimId'],
    resetChecklistPayload: ['resetType'],
    saveVehicleChecks: ['saveType'],
    setCustomerClaims: ['payload', 'stopId'],
    setDelivered: ['id', 'selectedStopId', 'outOfStockIds'],
    setDirectionsPolyline: ['payload'],
    setBundleProducts: ['payload'],
    setCannedContent: ['payload'],
    setItemOutOfStock: ['id'],
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
    startDelivering: null,
    showMustComplyWithTerms: null,
    toggleCheckJson: ['key'],
    toggleConfirmedItem: ['id'],
    toggleOutOfStock: ['id'],
    toggleModal: ['modal', 'show'],
    updateDriverActivity: null,
    updateChecklistProps: ['props'],
    updateDirectionsPolyline: null,
    updateProps: ['props'],
    updateSelectedStop: ['sID']
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

export const initialChecklist = {
  deliveryComplete: false,
  loadedVan: false,
  shiftEndVanChecks: false,
  shiftStartVanChecks: false,
  payload: {
    ...initialVehicleChecks
  },
  payloadAltered: false
};

export const initialState = {
  allItemsDone: false,
  bundledProducts: {},
  cannedContent: [],
  centerMapLocation: null,
  checklist: {},
  completedStopsIds: [],
  confirmedItem: [],
  deliveredStock: {},
  directionsPolyline: [],
  hasRoutes: false,
  optimisedRouting: true,
  orderedStock: [],
  orderedStopsIds: [],
  outOfStockIds: [],
  previousStopId: null,
  processing: true,
  selectedStopId: null,
  status: DS.NCI,
  stock: [],
  stockWithData: {},
  stops: {},
  userId: null
};

const deleteVanDamageImage = (state, { key, index }) =>
  produce(state, draft => {
    draft.checklist[draft.userId].payload.vehicleCheckDamage[
      key
    ].vehicleCheckDamageImage = draft.checklist[
      draft.userId
    ].payload.vehicleCheckDamage[key].vehicleCheckDamageImage.filter(
      (image, idx) => idx !== index
    );
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
      } else {
        draft.stops[selectedStopId].claims.selectedClaimId =
          unacknowledgedList.slice(1)[0].claimId;
      }
    } else {
      draft.stops[selectedStopId].claims.acknowledgedList[
        index
      ].driverResponses.push(response);
    }

    draft.stops[selectedStopId].claims.showReplyModal = false;
  });

const incrementDeliveredStock = (draft, { productId, quantity }) => {
  if (draft.bundledProducts[productId]) {
    for (const [bundledProductId, bundledQuantity] of Object.entries(
      draft.bundledProducts[productId]
    )) {
      if (!draft.deliveredStock[bundledProductId]) {
        draft.deliveredStock[bundledProductId] = 0;
      }
      draft.deliveredStock[bundledProductId] += quantity * bundledQuantity;
    }
  } else {
    if (!draft.deliveredStock[productId]) {
      draft.deliveredStock[productId] = 0;
    }
    draft.deliveredStock[productId] += quantity;
  }
};

const processingTrue = state =>
  produce(state, draft => {
    draft.processing = true;
  });

const resetChecklistFlags = checklist => {
  checklist.deliveryComplete = false;
  checklist.loadedVan = false;
  checklist.payloadAltered = false;
  checklist.shiftStartVanChecks = false;
  checklist.shiftEndVanChecks = false;
};

const resetSelectedStopInfo = draft => {
  draft.directionsPolyline = [];
  draft.allItemsDone = false;
  draft.confirmedItem = [];
  draft.outOfStockIds = [];
};

const resetVanDamage = (draft, key) => {
  return (draft.checklist[draft.userId].payload.vehicleCheckDamage[key] = {
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
    const selectedStopIndex = draft.orderedStopsIds.indexOf(selectedStopId);
    if (selectedStopIndex >= 0) {
      resetSelectedStopInfo(draft);
      draft.selectedStopId = null;
      draft.completedStopsIds.push(
        ...draft.orderedStopsIds.splice(selectedStopIndex, 1)
      );
      draft.stops[selectedStopId].status =
        requestType === 'delivered' ? 'completed' : 'rejected';

      for (const orderItem of Object.values(
        draft.stops[selectedStopId].orderItems
      )) {
        incrementDeliveredStock(draft, orderItem);
        if (outOfStockIds.includes(orderItem.key)) {
          orderItem.status = 3;
        } else {
          orderItem.status = requestType === 'delivered' ? 2 : 4;
        }
      }

      if (draft.orderedStopsIds.length === 0) {
        draft.status = DS.DELC;
        draft.checklist[draft.userId].deliveryComplete = true;
      }
    }
  });

export const clearCenterMapLocation = state =>
  produce(state, draft => {
    draft.centerMapLocation = null;
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

export const getForDriverSuccess = (state, { payload }) =>
  produce(state, draft => {
    draft.stockWithData = payload;
    let hasNonPendingOrders = false;
    let markedOrders = 0;

    if (draft.deliveryDate !== draft.stockWithData.deliveryDate) {
      draft.deliveryDate = draft.stockWithData.deliveryDate;
      draft.status = initialState.status;
      draft.stops = {};
      draft.orderedStopsIds = [];
      draft.completedStopsIds = [];
      draft.deliveredStock = {};
      resetChecklistFlags(draft.checklist[state.userId]);
    }

    draft.optimisedRouting = draft.stockWithData.isOptimised;

    /*
    BE deliveryState values for orderItems
    Pending = 1,
    Delivered = 2,
    OutOfStock = 3,
    Rejected = 4,
    Cancelled = 5,
    RejectedRefunded = 6
    */

    // PREPARE RAW STOPS
    const serverAddressIds = [];
    for (const { address, orderItems } of payload.items) {
      const computedAddress =
        (address.nameOrNumber ? `${address.nameOrNumber}` : '') +
        (address.line1 ? ` ${address.line1}` : '') +
        (address.postcodeOutward ? `, ${address.postcodeOutward}` : '') +
        (address.postcodeInward ? `${address.postcodeInward}` : '');
      const deliveryInstructions =
        address?.deliveryInstructions?.length > 0
          ? address.deliveryInstructions
          : null;
      serverAddressIds.push(parseInt(address.addressId));

      // create stop if it doesn't exist
      if (!draft.stops[address.addressId]) {
        // stop doesn't exist, create it
        // info cannot change during delivery night
        draft.stops[address.addressId] = {
          ...address,
          claims: {
            acknowledgedList: [],
            unacknowledgedList: [],
            showClaimModal: false
          },
          deliveryInstructions,
          description: I18n.t('screens:deliver.userId', {
            userId: address.userId
          }),
          key: address.addressId, // TODO can this be removed?
          icon: null, // TODO can this be removed?
          itemCount: 0,
          orderItems: {},
          searchHandle:
            computedAddress.toLowerCase() + address.userId.toString(),
          status: 'pending',
          title: computedAddress
        };
      }
      draft.stops[address.addressId].satisfactionStatus =
        address.satisfactionStatus || 0;

      // check order items and update
      for (const {
        deliveryState: status,
        measureDescription: description,
        orderItemId: key,
        productId,
        productName: title,
        quantity
      } of orderItems) {
        // create new order items if they do not exist already
        if (!draft.stops[address.addressId].orderItems[key]) {
          draft.stops[address.addressId].orderItems[key] = {
            description,
            key,
            productId,
            quantity,
            status,
            title
          };
          draft.stops[
            address.addressId
          ].searchHandle += ` ${title.toLowerCase()}`;
          draft.stops[address.addressId].itemCount += quantity;
        }
        // update order items and main stop status
        // if state pending and server state differs, update from server
        // otherwise keep local values
        if (
          draft.stops[address.addressId].orderItems[key].status === 1 &&
          draft.stops[address.addressId].orderItems[key].status !== status
        ) {
          draft.stops[address.addressId].orderItems[key].status = status;
          incrementDeliveredStock(
            draft,
            draft.stops[address.addressId].orderItems[key]
          );
        }

        if (draft.stops[address.addressId].status !== 'rejected') {
          switch (status) {
            case 4:
            case 6:
              draft.stops[address.addressId].status = 'rejected';
              break;
            case 2:
            case 3:
            case 5:
              draft.stops[address.addressId].status = 'completed';
              break;
          }
        }
      }

      switch (draft.stops[address.addressId].status) {
        case 'pending':
          if (!draft.orderedStopsIds.includes(address.addressId)) {
            draft.orderedStopsIds.push(address.addressId);
          }
          break;
        case 'rejected':
        case 'completed':
          markedOrders++;
          if (!draft.completedStopsIds.includes(address.addressId)) {
            draft.completedStopsIds.push(address.addressId);
          }
          break;
      }
    }

    // remove stops no longer on route
    let stopsToRemove = Object.keys(draft.stops).filter(
      key => !serverAddressIds.includes(parseInt(key))
    );
    for (const key of stopsToRemove) {
      if (['rejected', 'completed'].includes(draft.stops[key].status)) {
        markedOrders--;
      }
      const orderedStopIndex = draft.orderedStopsIds.indexOf(parseInt(key));
      if (orderedStopIndex >= 0) {
        draft.orderedStopsIds.splice(orderedStopIndex, 1);
      }
      const completedStopIndex = draft.completedStopsIds.indexOf(parseInt(key));
      if (completedStopIndex >= 0) {
        draft.completedStopsIds.splice(orderedStopIndex, 1);
      }
      delete draft.stops[key];
    }

    if (markedOrders > 0) {
      hasNonPendingOrders = true;
    }

    if (markedOrders === payload.itemCount) {
      draft.status = DS.DELC;
      draft.checklist[state.userId].deliveryComplete = true;
      draft.checklist[state.userId].shiftStartVanChecks = true;
      draft.checklist[state.userId].loadedVan = true;
    } else if (hasNonPendingOrders) {
      draft.status = DS.DEL;
      draft.checklist[state.userId].shiftStartVanChecks = true;
      draft.checklist[state.userId].loadedVan = true;
    }
  });

export const initChecklist = state =>
  produce(state, draft => {
    if (!draft?.checklist[draft?.userId] && draft?.userId) {
      draft.checklist[draft.userId] = {
        ...initialChecklist
      };
    }
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
    draft.checklist[state.userId][saveType] = true;
    if (saveType === 'shiftEndVanChecks') {
      draft.status = DS.SC;
    }
  });

export const setBundleProducts = (state, { payload }) =>
  produce(state, draft => {
    for (const bundledProduct of payload) {
      draft.bundledProducts[bundledProduct.productId] = {};
      for (const bundleProduct of bundledProduct.bundledProducts) {
        draft.bundledProducts[bundledProduct.productId][
          bundleProduct.productId
        ] = bundleProduct.quantity;
      }
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

export const setMileage = (state, { mileage }) =>
  produce(state, draft => {
    draft.checklist[draft.userId].payload.currentMileage = mileage;
  });

export const setRegistration = (state, { reg }) =>
  produce(state, draft => {
    draft.checklist[draft.userId].payload.vehicleRegistration = reg;
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
    if (!draft.checklist[draft.userId].payload.vehicleCheckDamage[key]) {
      resetVanDamage(draft, key);
    }

    draft.checklist[draft.userId].payload.vehicleCheckDamage[key].comments =
      comment;
  });

export const setVanDamageImage = (state, { key, imagePath, imageType }) =>
  produce(state, draft => {
    if (!draft.checklist[draft.userId].payload.vehicleCheckDamage[key]) {
      resetVanDamage(draft, key);
    }

    const images = [
      ...draft.checklist[draft.userId].payload.vehicleCheckDamage[key]
        .vehicleCheckDamageImage
    ];

    images.push({
      imagePath,
      imageType
    });

    draft.checklist[draft.userId].payload.vehicleCheckDamage[
      key
    ].vehicleCheckDamageImage = images;
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
    if (draft.status !== DS.DEL && draft.orderedStopsIds.length > 0) {
      draft.status = DS.DEL;
    }
  });

export const toggleCheckJson = (state, { key }) =>
  produce(state, draft => {
    draft.checklist[draft.userId].payload.checksJson[key] =
      !draft.checklist[draft.userId].payload.checksJson[key];
  });

// TODO reuse code from toggleConfirmedItem / toggleOutOfStock as one
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
      Object.keys(state.stops[state.selectedStopId]?.orderItems).length;
  });

// TODO reuse code from toggleConfirmedItem / toggleOutOfStock as one
export const toggleOutOfStock = (state, { id }) =>
  produce(state, draft => {
    draft.outOfStockIds = toggle(state.outOfStockIds, id);
    const idx = state.confirmedItem.indexOf(id);
    if (idx > -1) {
      draft.confirmedItem.splice(idx, 1);
    }
    draft.allItemsDone =
      draft.confirmedItem.length + draft.outOfStockIds.length ===
      Object.keys(state.stops[state.selectedStopId]?.orderItems).length;
  });

export const toggleModal = (state, { modal, show }) =>
  produce(state, draft => {
    draft.stops[draft.selectedStopId].claims[modal] = show;
  });

export const updateChecklistProps = (state, { props }) =>
  updateProps(state, {
    props: {
      checklist: {
        ...state.checklist,
        [state.userId]: { ...state.checklist[state.userId], ...props }
      }
    }
  });

export const setDirectionsPolyline = (state, { payload }) =>
  produce(state, draft => {
    draft.directionsPolyline = payload;
  });

export const updateSelectedStop = (state, { sID }) =>
  produce(state, draft => {
    resetSelectedStopInfo(draft);
    draft.previousStopId = draft.selectedStopId;
    draft.processing = false;
    draft.selectedStopId = sID;
    if (sID) {
      draft.stops[sID].claims.showReplyModal = false;
      draft.centerMapLocation = {
        latitude: draft.stops[sID].latitude,
        longitude: draft.stops[sID].longitude
      };
    }
  });

export default createReducer(initialState, {
  [Types.CLEAR_CENTER_MAP_LOCATION]: clearCenterMapLocation,
  [Types.CONTINUE_DELIVERING]: startDelivering,
  [Types.DELETE_VAN_DAMAGE_IMAGE]: deleteVanDamageImage,
  [Types.DRIVER_REPLY]: driverReply,
  [Types.GET_FOR_DRIVER]: processingTrue,
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_REJECT_DELIVERY_REASONS]: processingTrue,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS]: getVehicleStockForDriverSuccess,
  [Types.INIT_CHECKLIST]: initChecklist,
  [Types.REDIRECT_SET_SELECTED_CLAIM_ID]: setSelectedClaimId,
  [Types.RESET_CHECKLIST_PAYLOAD]: resetChecklistPayload,
  [Types.SAVE_VEHICLE_CHECKS]: saveVehicleChecks,
  [Types.SET_BUNDLE_PRODUCTS]: setBundleProducts,
  [Types.SET_CANNED_CONTENT]: setCannedContent,
  [Types.SET_CUSTOMER_CLAIMS]: setCustomerClaims,
  [Types.SET_DELIVERED]: setDelivered,
  [Types.SET_DIRECTIONS_POLYLINE]: setDirectionsPolyline,
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

export const checklist = state =>
  state.delivery?.checklist?.[state.delivery?.userId];

export const directionsPolyline = state => state.delivery?.directionsPolyline;

export const completedStopsIds = state => state.delivery?.completedStopsIds;

export const itemCount = state => state.delivery?.itemCount || 0;

export const optimisedRouting = state => state.delivery.optimisedRouting;

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
