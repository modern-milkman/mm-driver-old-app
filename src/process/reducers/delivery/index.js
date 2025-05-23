import { createActions, createReducer } from 'reduxsauce';

import I18n from 'Locales/I18n';
import { toggle, deliveryStates as DS } from 'Helpers';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    addPodImage: ['img'],
    addPodImageToDriverClaim: ['image', 'handledClaims', 'stopId'],
    clearCenterMapLocation: null,
    continueDelivering: null,
    deletePodImage: ['index'],
    deliverLater: ['selectedStopId'],
    driverReply: ['claimId', 'comment', 'acknowledgedClaim', 'index'],
    foregroundDeliveryActions: null,
    getBundleProducts: null,
    getCannedContent: null,
    getCustomerClaims: ['customerId', 'stopId'],
    getDriverDataFailure: null,
    getDriverReplyImage: ['driverResponses', 'claimIndex', 'stopId'],
    getForDriver: null,
    getForDriverSuccess: ['payload'],
    getRegistrationPlates: null,
    getRejectDeliveryReasons: null,
    getReturnTypes: null,
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: ['payload', 'deliveryDate'],
    incrementDeliveredStock: ['productId', 'quantity'],
    initChecklist: null,
    redirectSetSelectedClaimId: ['claimId'],
    refreshAllData: null,
    resetChecklistPayload: ['resetType'],
    saveVehicleChecks: ['saveType'],
    scanBarcode: ['barcodeValue'],
    scanBarcodeError: null,
    scanBarcodeSuccess: ['itemId'],
    setCustomerClaims: ['payload', 'stopId'],
    setDelivered: [
      'id',
      'selectedStopId',
      'outOfStockIds',
      'podImages',
      'hasCollectedEmpties',
      'outOfStockIdsList'
    ],
    setEmpty: ['prop', 'value'],
    setDirectionsPolyline: ['payload'],
    setBundleProducts: ['payload'],
    setCannedContent: ['payload'],
    setItemOutOfStock: ['id'],
    setMileage: ['mileage'],
    setValidNumberPlate: ['registrationCheckOverride'],
    setRegistration: ['reg'],
    setRejected: [
      'id',
      'selectedStopId',
      'outOfStockIds',
      'reasonType',
      'reasonMessage',
      'hasCollectedEmpties',
      'outOfStockIdsList'
    ],
    setRegistrationPlates: ['payload'],
    setRejectDeliveryReasons: ['payload'],
    setReturnTypes: ['payload'],
    setSelectedClaimId: ['claim'],
    showMustComplyWithTerms: null,
    showPODRequired: null,
    startDelivering: null,
    toggleConfirmedItem: ['id'],
    toggleModal: ['modal', 'show'],
    toggleOutOfStock: ['id', 'selectedItemOrderId', 'selectedItemQty'],
    updateChecklistProps: ['props'],
    updateDirectionsPolyline: null,
    updateDriverActivity: null,
    updateProps: ['props'],
    updateSelectedStop: ['sID'],
    updateStopAutoSelectTimestamp: ['sID']
  },
  { prefix: 'delivery/' }
);

const initialVehicleChecks = {
  end: {
    shiftEnd: true
  },
  general: {
    emptiesCollected: {},
    shiftEnd: false,
    shiftStart: false
  },
  start: {
    currentMileage: '',
    shiftStart: true,
    vehicleRegistration: ''
  }
};

export const initialChecklist = {
  deliveryComplete: false,
  emptiesRequired: false,
  emptiesScreenDirty: false,
  loadedVan: false,
  loadedVanMM: false,
  loadedVanTPL: false,
  loadedVanBarcode: false,
  loadedVanItems: {},
  shiftEndVanChecks: false,
  shiftStartVanChecks: false,
  payload: {
    ...initialVehicleChecks.general
  },
  payloadAltered: false
};

export const initialState = {
  allItemsDone: false,
  bundledProducts: {},
  cannedContent: [],
  loaderInfo: null,
  centerMapLocation: null,
  checklist: {},
  completedStopsIds: [],
  confirmedItem: [],
  deliveredStock: {},
  directionsPolyline: [],
  failedItems: 0,
  hasRoutes: false,
  orderedStock: [],
  orderedStopsIds: [],
  outOfSequenceIds: [],
  outOfStockIds: [],
  outOfStockIdsList: [],
  previousStopId: null,
  processing: true,
  selectedStopId: null,
  serverAddressIds: [],
  status: DS.NCI,
  stock: [],
  stockWithData: {},
  stops: {},
  userId: null
};

const addPodImage = (state, { img: { uri, mime } }) =>
  produce(state, draft => {
    draft.podImages.push({ uri, mime });
  });

const addPodImageToDriverClaim = (state, { image, handledClaims, stopId }) =>
  produce(state, draft => {
    handledClaims.forEach(claimId => {
      if (state.stops[stopId].claims.acknowledgedClaims[claimId]) {
        draft.stops[stopId].claims.acknowledgedClaims[claimId].driverResponses =
          state.stops[stopId].claims.acknowledgedClaims[
            claimId
          ].driverResponses.map(dr => ({
            ...dr,
            isLocalImage: true,
            localImage: image
          }));
      }
    });
  });

const deletePodImage = (state, { index }) =>
  produce(state, draft => {
    draft.podImages.splice(index, 1);
  });

const deliverLater = (state, { selectedStopId }) =>
  produce(state, draft => {
    const selectedStopIndex = draft.orderedStopsIds.indexOf(selectedStopId);
    if (selectedStopIndex >= 0) {
      resetSelectedStopInfo(draft);
      draft.selectedStopId = null;
      draft.stops[selectedStopId].sequenceNo = -1;
      draft.outOfSequenceIds.push(selectedStopId);
      draft.orderedStopsIds.push(
        ...draft.orderedStopsIds.splice(selectedStopIndex, 1)
      );
    }
  });

const driverReply = (state, { claimId, comment, acknowledgedClaim }) =>
  produce(state, draft => {
    const selectedStopId = state.selectedStopId;
    const response = {
      driverAcknowledged: true,
      claimId,
      comment,
      responseDateTime: new Date()
    };

    if (!acknowledgedClaim) {
      const unacknowledgedClaims = {
        ...state.stops[selectedStopId].claims.unacknowledgedClaims
      };
      const selectedClaim = unacknowledgedClaims[claimId];

      delete unacknowledgedClaims[claimId];

      draft.stops[selectedStopId].claims.unacknowledgedClaims =
        unacknowledgedClaims;

      draft.stops[selectedStopId].claims.acknowledgedClaims[claimId] = {
        ...selectedClaim,
        driverResponses: [...selectedClaim.driverResponses, response]
      };

      draft.stops[selectedStopId].claims.showCount =
        draft.stops[selectedStopId].claims.showCount + 1;

      if (Object.values(unacknowledgedClaims).length === 0) {
        draft.stops[selectedStopId].claims.showClaimModal = false;
      } else {
        draft.stops[selectedStopId].claims.selectedClaimId =
          Object.keys(unacknowledgedClaims)[0];
      }
    } else {
      draft.stops[selectedStopId].claims.acknowledgedClaims[
        claimId
      ].driverResponses.push(response);
    }

    draft.stops[selectedStopId].claims.showReplyModal = false;
  });

const getForDriver = state =>
  produce(state, draft => {
    draft.processing = true;
    draft.loaderInfo = 'getForDriver';
  });

const incrementDeliveredStock = (draft, { productId, quantity }) => {
  if (draft.bundledProducts[productId]) {
    for (const [bundledProductId, bundledProduct] of Object.entries(
      draft.bundledProducts[productId]
    )) {
      if (!draft.deliveredStock[bundledProductId]) {
        draft.deliveredStock[bundledProductId] = 0;
      }
      draft.deliveredStock[bundledProductId] +=
        quantity * bundledProduct.quantity;
    }
  } else {
    if (!draft.deliveredStock[productId]) {
      draft.deliveredStock[productId] = 0;
    }
    draft.deliveredStock[productId] += quantity;
  }
};

const resetChecklistFlags = checklist => {
  checklist.deliveryComplete = false;
  checklist.emptiesRequired = false;
  checklist.emptiesScreenDirty = false;
  checklist.loadedVan = false;
  checklist.loadedVanMM = false;
  checklist.loadedVanTPL = false;
  checklist.loadedVanBarcode = false;
  checklist.loadedVanItems = {};
  checklist.payloadAltered = false;
  checklist.shiftStartVanChecks = false;
  checklist.shiftEndVanChecks = false;
};

const resetSelectedStopInfo = draft => {
  draft.podImages = [];
  draft.directionsPolyline = [];
  draft.allItemsDone = false;
  draft.confirmedItem = [];
  draft.outOfStockIds = [];
  draft.outOfStockIdsList = [];
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
      const outOfSequenceIndex = draft.outOfSequenceIds.indexOf(selectedStopId);
      if (outOfSequenceIndex >= 0) {
        draft.outOfSequenceIds.splice(outOfSequenceIndex, 1);
      }
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

const setLoaderInfo = (key, state) =>
  produce(state, draft => {
    draft.loaderInfo = key;
  });

export const clearCenterMapLocation = state =>
  produce(state, draft => {
    draft.centerMapLocation = null;
  });

export const getVehicleStockForDriverSuccess = (state, { payload }) =>
  produce(state, draft => {
    draft.additionalItemCount = 0;
    draft.barcodeItemCount = 0;
    draft.hasRoutes = payload.length > 0;
    draft.itemCount = 0;
    draft.loaderInfo = null;
    draft.orderedStock = {};
    draft.stock = payload;
    draft.TPLItemCount = 0;

    for (const route of payload) {
      route.vehicleStockItems.forEach(item => {
        const formattedProduct = {
          additionalQuantity: route.isAdditionalStock ? item.quantity : 0,
          barcodeValue: item.barcodeValue,
          barcodeScanMandatory: item.barcodeScanMandatory,
          description: item.measureDescription,
          disabled: true, // items in load van should not be tappable
          is3PL: item.is3PL,
          key: item.productId,
          quantity: item.quantity,
          title: item.productName,
          productId: item.productId
        };

        if (draft.orderedStock[item.productId]) {
          draft.orderedStock[item.productId].quantity += item.quantity;
          if (route.isAdditionalStock) {
            draft.orderedStock[item.productId].additionalQuantity +=
              item.quantity;
          }
        } else {
          draft.orderedStock[item.productId] = formattedProduct;
        }

        if (route.isAdditionalStock) {
          draft.additionalItemCount += item.quantity;
        }

        // priorities: barcode mandatory, 3PL, regular
        // reasoning, both regular and 3PLs might have mandatory barcode scanning required
        // CAUTION
        // if different routes contain vehicleStockItems with same product ID,
        // but with different barcodeValue / barcodeScanMandatory / is3PL
        // item totals shown by driver app will not be computed correctly
        if (item.barcodeScanMandatory) {
          draft.barcodeItemCount += item.quantity;
        } else if (item.is3PL) {
          draft.TPLItemCount += item.quantity;
        } else {
          draft.itemCount += item.quantity;
        }
      });
    }
    draft.orderedStock = Object.values(draft.orderedStock).filter(
      product => product
    );

    // the edge case in which all 3 counters are zero, for which loadedVan should be true
    // should not be possible thanks to backend constraints
    if (draft.barcodeItemCount === 0) {
      draft.checklist[state.userId].loadedVanBarcode = true;
    }
    if (draft.TPLItemCount === 0) {
      draft.checklist[state.userId].loadedVanTPL = true;
    }
    if (draft.itemCount === 0) {
      draft.checklist[state.userId].loadedVanMM = true;
    }

    draft.processing = false;
  });

export const getForDriverSuccess = (state, { payload }) =>
  produce(state, draft => {
    draft.loaderInfo = 'getVehicleStockForDriver';
    draft.serverAddressIds = [];
    draft.stockWithData = payload;

    let hasNonPendingOrders = false;
    let markedOrders = 0;

    if (draft.deliveryDate !== draft.stockWithData.deliveryDate) {
      draft.deliveryDate = draft.stockWithData.deliveryDate;
      draft.status = initialState.status;
      draft.stops = {};
      draft.orderedStopsIds = [];
      draft.outOfSequenceIds = [];
      draft.completedStopsIds = [];
      draft.deliveredStock = {};
      draft.failedItems = 0;
      resetChecklistFlags(draft.checklist[state.userId]);
    }

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
    for (const { address, orderItems, sequenceNo } of payload.items) {
      const computedAddress =
        (address.nameOrNumber ? `${address.nameOrNumber}` : '') +
        (address.line1 ? ` ${address.line1}` : '') +
        (address.postcodeOutward ? `, ${address.postcodeOutward}` : '') +
        (address.postcodeInward ? `${address.postcodeInward}` : '');
      const deliveryInstructions =
        address?.deliveryInstructions?.replace(/\s/g, '').length > 0
          ? address.deliveryInstructions
          : null;
      draft.serverAddressIds.push(parseInt(address.addressId));

      // create stop if it doesn't exist
      if (!draft.stops[address.addressId]) {
        // stop doesn't exist, create it
        // info cannot change during delivery night
        draft.stops[address.addressId] = {
          ...address,
          barcodeValues: {},
          claims: {
            acknowledgedClaims: {},
            unacknowledgedClaims: {},
            unacknowledgedListIds: [],
            showClaimModal: false
          },
          deliveryInstructions,
          description: I18n.t('screens:deliver.userId', {
            userId: address.userId
          }),
          has3PLProducts: false,
          key: address.addressId, // TODO can this be removed?
          icon: null, // TODO can this be removed?
          itemCount: 0,
          orderItems: {},
          searchHandle:
            computedAddress.toLowerCase() + address.userId.toString(),
          sequenceNo: sequenceNo,
          status: 'pending',
          title: computedAddress
        };
      }

      draft.stops[address.addressId].proofOfDeliveryRequired =
        address.proofOfDeliveryRequired;

      draft.stops[address.addressId].satisfactionStatus =
        address.satisfactionStatus || 0;

      // check order items and update
      for (const {
        barcodeValue,
        barcodeScanMandatory,
        deliveryState: status,
        is3PL,
        measureDescription: description,
        orderItemId: key,
        productId,
        productName: title,
        quantity
      } of orderItems) {
        if (barcodeValue) {
          draft.stops[address.addressId].barcodeValues[barcodeValue] = key;
        }
        if (is3PL) {
          draft.stops[address.addressId].has3PLProducts = true;
        }

        // create new order items if they do not exist already
        if (!draft.stops[address.addressId].orderItems[key]) {
          draft.stops[address.addressId].orderItems[key] = {
            barcodeValue,
            barcodeScanMandatory,
            description,
            is3PL,
            isBundle: !!state.bundledProducts[productId],
            key,
            productId,
            quantity,
            status,
            title
          };
          draft.stops[address.addressId].searchHandle +=
            ` ${title.toLowerCase()}`;
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
          if (sequenceNo < 0) {
            if (!draft.outOfSequenceIds.includes(address.addressId)) {
              draft.outOfSequenceIds.push(address.addressId);
            }
          }
          break;
        case 'rejected':
        case 'completed':
          markedOrders++;
          if (!draft.completedStopsIds.includes(address.addressId)) {
            draft.completedStopsIds.push(address.addressId);
          }
          const outOfSequenceIndex = draft.outOfSequenceIds.indexOf(
            address.addressId
          );
          if (outOfSequenceIndex >= 0) {
            draft.outOfSequenceIds.splice(outOfSequenceIndex, 1);
          }
          const orderedStopIndex = draft.orderedStopsIds.indexOf(
            address.addressId
          );
          if (orderedStopIndex >= 0) {
            draft.orderedStopsIds.splice(orderedStopIndex, 1);
          }
          break;
      }
    }

    // remove stops no longer on route
    let stopsToRemove = Object.keys(draft.stops).filter(
      key => !draft.serverAddressIds.includes(parseInt(key))
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
      const outOfSequenceIndex = draft.outOfSequenceIds.indexOf(parseInt(key));
      if (outOfSequenceIndex >= 0) {
        draft.outOfSequenceIds.splice(outOfSequenceIndex, 1);
      }
      delete draft.stops[key];
    }

    if (markedOrders > 0) {
      hasNonPendingOrders = true;
    }

    if (markedOrders === payload.items.length) {
      if (draft.checklist[state.userId].shiftEndVanChecks) {
        draft.status = DS.SC;
      } else {
        draft.status = DS.SEC;
      }
      draft.checklist[state.userId].deliveryComplete = true;
      draft.checklist[state.userId].shiftStartVanChecks = true;
      draft.checklist[state.userId].loadedVan = true;
      draft.checklist[state.userId].loadedVanMM = true;
      draft.checklist[state.userId].loadedVanTPL = true;
      draft.checklist[state.userId].loadedVanBarcode = true;
      draft.checklist[state.userId].loadedVanItems = {};
    } else if (hasNonPendingOrders) {
      draft.status = DS.DEL;
      draft.checklist[state.userId].shiftStartVanChecks = true;
      draft.checklist[state.userId].loadedVanMM = true;
      draft.checklist[state.userId].loadedVanTPL = true;
      draft.checklist[state.userId].loadedVanBarcode = true;
      draft.checklist[state.userId].loadedVan = true;
      draft.checklist[state.userId].loadedVanItems = {};
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
          ...initialVehicleChecks.general,
          ...(resetType === 'shiftEnd' && initialVehicleChecks.end),
          ...(resetType === 'shiftStart' && initialVehicleChecks.start),
          emptiesCollected: { ...draft.emptiesCollected }
        }
      }
    })
  );

export const saveVehicleChecks = (state, { saveType }) =>
  produce(state, draft => {
    draft.checklist[state.userId][saveType] = true;
    if (draft.checklist[state.userId].shiftEndVanChecks) {
      draft.status = DS.SC;
    }
  });

export const setBundleProducts = (state, { payload }) =>
  produce(state, draft => {
    draft.bundledProducts = payload.reduce((bundledProduct, item) => {
      bundledProduct[item.productId] = item.bundledProducts.reduce((bp, el) => {
        bp[el.productId] = el;
        return bp;
      }, {});
      return bundledProduct;
    }, {});
  });

export const setCannedContent = (state, { payload }) =>
  produce(state, draft => {
    draft.cannedContent = payload;
  });

export const setCustomerClaims = (state, { payload, stopId }) =>
  produce(state, draft => {
    const unacknowledgedClaims = {};
    const acknowledgedClaims = {};
    const unacknowledgedListIds = [];

    payload.forEach(claim => {
      if (!claim.driverAcknowledged) {
        unacknowledgedClaims[claim.claimId] = claim;
        unacknowledgedListIds.push(claim.claimId);
        draft.stops[stopId].claims.showClaimModal = true;
      } else {
        acknowledgedClaims[claim.claimId] = claim;
      }
    });

    if (unacknowledgedListIds.length > 0) {
      draft.stops[stopId].claims.showCount = 1;
      draft.stops[stopId].claims.selectedClaimId = unacknowledgedListIds[0];
      draft.stops[stopId].claims.unacknowledgedListNr =
        unacknowledgedListIds.length;
    }
    draft.stops[stopId].claims.acknowledgedClaims = acknowledgedClaims;
    draft.stops[stopId].claims.unacknowledgedClaims = unacknowledgedClaims;
    draft.stops[stopId].claims.unacknowledgedListIds = unacknowledgedListIds;
  });

export const setDelivered = (state, params) =>
  setDeliveredOrRejected(state, 'delivered', params);

export const setEmpty = (state, { prop, value }) =>
  produce(state, draft => {
    const emptiesCollected =
      draft.checklist[draft.userId].payload.emptiesCollected;

    emptiesCollected[prop] = {
      ...emptiesCollected[prop],
      value
    };

    draft.checklist[draft.userId].emptiesScreenDirty =
      Object.values(emptiesCollected).filter(el => parseInt(el.value) >= 0)
        .length > 0;
  });

export const setItemOutOfStock = state =>
  produce(state, draft => {
    draft.failedItems = state.failedItems + 1;
  });

export const setMileage = (state, { mileage }) =>
  produce(state, draft => {
    draft.checklist[draft.userId].payload.currentMileage = mileage;
  });

export const setValidNumberPlate = (state, { registrationCheckOverride }) =>
  produce(state, draft => {
    draft.checklist[draft.userId].payload.registrationCheckOverride =
      registrationCheckOverride;
  });

export const setRegistration = (state, { reg }) =>
  produce(state, draft => {
    draft.checklist[draft.userId].payload.vehicleRegistration = reg;
  });

export const setRegistrationPlates = (state, { payload }) =>
  produce(state, draft => {
    draft.registrationPlates = Array.isArray(payload) ? payload : [];
  });

export const setRejected = (state, params) =>
  setDeliveredOrRejected(state, 'rejected', params);

export const setRejectDeliveryReasons = (state, { payload }) =>
  produce(state, draft => {
    draft.rejectReasons = payload;
  });

export const setReturnTypes = (state, { payload }) =>
  produce(state, draft => {
    draft.emptiesCollected = {};
    for (const { id, description } of payload) {
      draft.emptiesCollected[id] = {
        id,
        description
      };
    }
  });

export const setSelectedClaimId = (state, { claimId }) =>
  produce(state, draft => {
    const selectedStopId = draft.selectedStopId;
    draft.stops[selectedStopId].claims.selectedClaimId = claimId;
  });

export const startDelivering = state =>
  produce(state, draft => {
    if (draft.status !== DS.DEL && draft.orderedStopsIds.length > 0) {
      draft.status = DS.DEL;
    }
  });

// TODO reuse code from toggleConfirmedItem / toggleOutOfStock as one
export const toggleConfirmedItem = (state, { id }) =>
  produce(state, draft => {
    const _newArrayOfStockObject = draft?.outOfStockIdsList || [];
    const newArrayofStockObject = _newArrayOfStockObject.flat();
    const index = draft?.outOfStockIdsList?.findIndex(item => item.id === id);
    if (index !== -1) {
      if (newArrayofStockObject.length) {
        newArrayofStockObject.splice(index, 1);
      }
    }
    draft.outOfStockIdsList = newArrayofStockObject;

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
export const toggleOutOfStock = (
  state,
  { id, selectedItemOrderId, selectedItemQty }
) =>
  produce(state, draft => {
    const _newArrayOfStockObject = draft?.outOfStockIdsList || [];
    const newArrayofStockObject = _newArrayOfStockObject.flat();
    const index = draft?.outOfStockIdsList?.findIndex(
      item => item.id === selectedItemOrderId
    );
    let isUpdateOutOfStockItem = false;
    if (index !== -1) {
      if (newArrayofStockObject.length) {
        newArrayofStockObject.splice(index, 1);
        let outOfStockObject = {
          id: selectedItemOrderId,
          quantity: selectedItemQty
        };
        newArrayofStockObject.push(outOfStockObject);
        isUpdateOutOfStockItem = true;
      }
    } else {
      let outOfStockObject = {
        id: selectedItemOrderId,
        quantity: selectedItemQty
      };
      newArrayofStockObject.push(outOfStockObject);
    }
    draft.outOfStockIdsList = newArrayofStockObject;

    // for (const orderItem of Object.values(
    //   draft.stops[selectedStopId].orderItems
    // )) {
    //   orderItem.status = requestType === 'delivered' ? 2 : 4;

    // }

    if (!isUpdateOutOfStockItem) {
      draft.outOfStockIds = toggle(state.outOfStockIds, id);
      const idx = state.confirmedItem.indexOf(id);
      if (idx > -1) {
        draft.confirmedItem.splice(idx, 1);
      }
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

export const updateStopAutoSelectTimestamp = (state, { sID }) =>
  produce(state, draft => {
    if (sID) {
      draft.stops[sID].autoSelectTimestamp = Date.now();
    }
  });

export default createReducer(initialState, {
  [Types.ADD_POD_IMAGE]: addPodImage,
  [Types.ADD_POD_IMAGE_TO_DRIVER_CLAIM]: addPodImageToDriverClaim,
  [Types.CLEAR_CENTER_MAP_LOCATION]: clearCenterMapLocation,
  [Types.CONTINUE_DELIVERING]: startDelivering,
  [Types.DELETE_POD_IMAGE]: deletePodImage,
  [Types.DELIVER_LATER]: deliverLater,
  [Types.DRIVER_REPLY]: driverReply,
  [Types.GET_FOR_DRIVER]: getForDriver,
  [Types.GET_BUNDLE_PRODUCTS]: setLoaderInfo.bind(null, 'bundles'),
  [Types.GET_DRIVER_DATA_FAILURE]: setLoaderInfo.bind(null, null),
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_REGISTRATION_PLATES]: setLoaderInfo.bind(
    null,
    'registrationPlates'
  ),
  [Types.GET_REJECT_DELIVERY_REASONS]: setLoaderInfo.bind(
    null,
    'rejectReasons'
  ),
  [Types.GET_RETURN_TYPES]: setLoaderInfo.bind(null, 'returnTypes'),
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
  [Types.SET_EMPTY]: setEmpty,
  [Types.SET_ITEM_OUT_OF_STOCK]: setItemOutOfStock,
  [Types.SET_MILEAGE]: setMileage,
  [Types.SET_REGISTRATION]: setRegistration,
  [Types.SET_REGISTRATION_PLATES]: setRegistrationPlates,
  [Types.SET_REJECT_DELIVERY_REASONS]: setRejectDeliveryReasons,
  [Types.SET_REJECTED]: setRejected,
  [Types.SET_RETURN_TYPES]: setReturnTypes,
  [Types.SET_SELECTED_CLAIM_ID]: setSelectedClaimId,
  [Types.SET_VALID_NUMBER_PLATE]: setValidNumberPlate,
  [Types.START_DELIVERING]: startDelivering,
  [Types.TOGGLE_CONFIRMED_ITEM]: toggleConfirmedItem,
  [Types.TOGGLE_OUT_OF_STOCK]: toggleOutOfStock,
  [Types.TOGGLE_MODAL]: toggleModal,
  [Types.UPDATE_CHECKLIST_PROPS]: updateChecklistProps,
  [Types.UPDATE_PROPS]: updateProps,
  [Types.UPDATE_SELECTED_STOP]: updateSelectedStop,
  [Types.UPDATE_STOP_AUTO_SELECT_TIMESTAMP]: updateStopAutoSelectTimestamp
});

export const additionalItemCount = state => state.delivery?.additionalItemCount;

export const barcodeItemCount = state => state.delivery?.barcodeItemCount || 0;

export const checklist = state =>
  state.delivery?.checklist?.[state.delivery?.userId];

export const completedStopsIds = state => state.delivery?.completedStopsIds;

export const directionsPolyline = state => state.delivery?.directionsPolyline;

export const failedItems = state => state.delivery?.failedItems;

export const itemCount = state => state.delivery?.itemCount || 0;

export const isOptimised = state => state.delivery?.stockWithData?.isOptimised;

export const loadedVanItems = state =>
  state.delivery?.checklist?.[state.delivery?.userId].loadedVanItems;

export const orderedStock = state => state.delivery.orderedStock;

export const orderedStopsIds = state =>
  (state.delivery?.stockWithData?.isOptimised &&
    state.device.showAllPendingStops) ||
  !state.delivery?.stockWithData?.isOptimised
    ? state.delivery?.orderedStopsIds
    : state.delivery?.orderedStopsIds.slice(
        0,
        state.device.optimisedStopsToShow
      );

export const outOfSequenceIds = state => state.delivery?.outOfSequenceIds;

export const routeDescription = state =>
  state.delivery?.stockWithData?.routeDescription;

//REMIND ME Theoretically it should not have multiple routes/night, BE informed
export const routeId = state => state.delivery?.stock[0]?.routeId;

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

export const serverAddressIds = state => state.delivery?.serverAddressIds;

export const status = state => state.delivery?.status;

export const stock = state => state.delivery?.stock;

export const stops = state => state.delivery?.stops;

export const stopCount = state =>
  Object.keys(state.delivery?.stops).length || 0;

export const TPLItemCount = state => state.delivery?.TPLItemCount || 0;
