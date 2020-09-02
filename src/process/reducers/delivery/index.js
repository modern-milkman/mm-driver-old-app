import { createActions, createReducer } from 'reduxsauce';

import { Point, solve as salesman } from 'Services/salesman';
import { checkAtLeastOneItem, currentDay, formatDate, toggle } from 'Helpers';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    getForDriver: null,
    getForDriverSuccess: ['payload'],
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: ['payload', 'deliveryDate'],
    optimizeStops: ['currentLocation', 'returnPosition'],
    setDelivered: ['id'],
    setDeliveredOrRejectedFailure: null,
    setDeliveredOrRejectedSuccess: null,
    setItemOutOfStock: ['id'],
    setRejected: ['id', 'reasonMessage'],
    startDelivering: [],
    toggleConfirmedItem: ['id'],
    toggleOutOfStock: ['id'],
    updateCurrentDayProps: ['props'],
    updateDirectionsPolyline: ['payload'],
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

const initialState = {
  processing: true,
  [formatDate(new Date())]: {
    allItemsDone: false,
    confirmedItem: [],
    completedStopsIds: [],
    deliveryStatus: 3,
    directionsPolyline: [],
    groupedStock: {},
    hasRoutes: false,
    orderedStopsIds: [],
    outOfStockIds: [],
    selectedStopId: null,
    stock: [],
    stockWithData: {},
    stops: {}
  }
};

const processingTrue = (state) =>
  produce(state, (draft) => {
    draft.processing = true;
  });

export const reset = () => initialState;

export const getVehicleStockForDriverSuccess = (
  state,
  { deliveryDate, payload }
) =>
  produce(state, (draft) => {
    const formatedDate = formatDate(new Date(deliveryDate));
    const groupedItems = payload.reduce((routeRes, route) => {
      route.vehicleStockItems.forEach((item) => {
        routeRes[item.categoryDescription] =
          routeRes[item.categoryDescription] || {};
        routeRes[item.categoryDescription][item.productName] = routeRes[
          item.categoryDescription
        ][item.productName] || {
          rightText: 0,
          title: item.productName,
          description: item.measureDescription
        };

        routeRes[item.categoryDescription][item.productName] = {
          ...routeRes[item.categoryDescription][item.productName],
          rightText:
            routeRes[item.categoryDescription][item.productName]?.rightText +
            item.quantity
        };
      });

      return routeRes;
    }, Object.create(null));

    draft[formatedDate].stock = payload;
    draft[formatedDate].groupedStock = groupedItems;
    draft[formatedDate].hasRoutes = payload.length > 0;
    draft.processing = false;
  });

export const getForDriverSuccess = (state, { payload }) =>
  produce(state, (draft) => {
    const formatedDate = formatDate(new Date(payload.deliveryDate));

    draft[formatedDate].stockWithData = payload;

    draft[formatedDate].deliveryStatus = checkAtLeastOneItem(
      payload?.items,
      1,
      true
    )
      ? checkAtLeastOneItem(payload?.items, 1)
        ? 2
        : 3
      : 0;
  });

export const setDeliveredOrRejectedFailure = (state) =>
  produce(state, (draft) => {
    const cd = currentDay();

    draft[cd].directionsPolyline = [];
    draft[cd].allItemsDone = false;
    draft[cd].confirmedItem = [];
    draft[cd].outOfStockIds = [];
    draft.processing = false;
  });

export const setDeliveredOrRejectedSuccess = (state) =>
  produce(state, (draft) => {
    const cd = currentDay();
    draft[cd].directionsPolyline = [];
    draft[cd].completedStopsIds.push(
      ...draft[cd].orderedStopsIds.splice(
        draft[cd].orderedStopsIds.indexOf(draft[cd].selectedStopId),
        1
      )
    );

    draft[cd].allItemsDone = false;
    draft[cd].confirmedItem = [];
    draft[cd].outOfStockIds = [];
    draft[cd].stops[draft[cd].selectedStopId].status = 'completed';

    if (draft[cd].orderedStopsIds.length > 0) {
      draft[cd].selectedStopId = draft[cd].orderedStopsIds[0];
    } else {
      draft[cd].selectedStopId = null;
      draft[cd].deliveryStatus = 3;
    }
    draft.processing = false;
  });

export const startDelivering = (state) =>
  produce(state, (draft) => {
    const cd = currentDay();

    for (const item of state[cd].stockWithData.items) {
      const {
        address: { addressId, latitude, longitude }
      } = item;

      if (!draft[cd].stops[addressId]) {
        if (item.delivery_stateID === 1) {
          draft[cd].orderedStopsIds.push(addressId);
        } else {
          draft[cd].completedStopsIds.push(addressId);
        }
        draft[cd].stops[addressId] = {
          status: item.delivery_stateID === 1 ? 'pending' : 'completed',
          addressId,
          customerId: item.customerId,
          latitude,
          longitude,
          forename: item.forename,
          surname: item.surname,
          phoneNumber: item.phoneNumber,
          orders: [],
          orderID: item.orderID,
          fullAddress:
            (item.address.name_number ? `${item.address.name_number}` : '') +
            (item.address.line1 ? `, ${item.address.line1}` : '') +
            (item.address.line2 ? `, ${item.address.line2}` : '')
        };
      }
      draft[cd].stops[addressId].orders.push(item);

      draft[cd].stops[addressId].itemCount =
        (draft[cd].stops[addressId]?.itemCount
          ? draft[cd].stops[addressId].itemCount
          : 0) + item.quantity;
    }

    draft.processing = true;
    draft[cd].deliveryStatus = 2;
  });

export const toggleConfirmedItem = (state, { id }) =>
  produce(state, (draft) => {
    const cd = currentDay();
    draft[cd].confirmedItem = toggle(state[cd].confirmedItem, id);

    const idx = state[cd].outOfStockIds.indexOf(id);
    if (idx > -1) {
      draft[cd].outOfStockIds.splice(idx, 1);
    }
    // TODO reuse code from toggleConfirmedItem / toggleOutOfStock as one
    draft[cd].allItemsDone =
      draft[cd].confirmedItem.length + draft[cd].outOfStockIds.length ===
      state[cd].stops[state[cd].selectedStopId]?.orders.length;
  });

export const toggleOutOfStock = (state, { id }) =>
  produce(state, (draft) => {
    const cd = currentDay();
    draft[cd].outOfStockIds = toggle(state[cd].outOfStockIds, id);
    const idx = state[cd].confirmedItem.indexOf(id);
    if (idx > -1) {
      draft[cd].confirmedItem.splice(idx, 1);
    }
    draft[cd].allItemsDone =
      draft[cd].confirmedItem.length + draft[cd].outOfStockIds.length ===
      state[cd].stops[state[cd].selectedStopId]?.orders.length;
  });

export const optimizeStops = (state, { currentLocation, returnPosition }) =>
  produce(state, (draft) => {
    const cd = currentDay();
    let dummyIndex = null;
    let returnPositionIndex = null;
    const stops = [
      new Point(
        currentLocation.latitude,
        currentLocation.longitude,
        'CURRENT_LOCATION'
      )
    ];
    for (const addressId of state[cd].orderedStopsIds) {
      const item = state[cd].stops[addressId];
      stops.push(new Point(item?.latitude, item?.longitude, addressId));
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
    optimizedRoute.splice(0, 1);
    if (hasDummy) {
      optimizedRoute.splice(optimizedRoute.indexOf(dummyIndex), 1);
    }
    if (returnPosition) {
      optimizedRoute.splice(optimizedRoute.indexOf(returnPositionIndex), 1);
    }
    draft[cd].orderedStopsIds = [];
    optimizedRoute.map((i) => draft[cd].orderedStopsIds.push(stops[i].key));
    draft[cd].selectedStopId = draft[cd].orderedStopsIds[0];
    draft.processing = false;
  });

export const updateCurrentDayProps = (state, { props }) => {
  let cd = currentDay(); //This will need to change with the current day prop
  return { ...state, [cd]: { ...state[cd], ...props } };
};

export const updateDirectionsPolyline = (state, { payload }) =>
  produce(state, (draft) => {
    let cd = currentDay(); //This will need to change with the current day prop
    draft[cd].directionsPolyline = payload;
  });

export const updateSelectedStop = (state, { sID }) =>
  produce(state, (draft) => {
    let cd = currentDay(); //This will need to change with the current day prop
    draft[cd].directionsPolyline = [];
    draft[cd].selectedStopId = sID;
  });

export default createReducer(initialState, {
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS]: getVehicleStockForDriverSuccess,
  [Types.OPTIMIZE_STOPS]: optimizeStops,
  [Types.SET_DELIVERED]: processingTrue,
  [Types.SET_DELIVERED_OR_REJECTED_FAILURE]: setDeliveredOrRejectedFailure,
  [Types.SET_DELIVERED_OR_REJECTED_SUCCESS]: setDeliveredOrRejectedSuccess,
  [Types.SET_REJECTED]: processingTrue,
  [Types.START_DELIVERING]: startDelivering,
  [Types.TOGGLE_CONFIRMED_ITEM]: toggleConfirmedItem,
  [Types.TOGGLE_OUT_OF_STOCK]: toggleOutOfStock,
  [Types.UPDATE_CURRENT_DAY_PROPS]: updateCurrentDayProps,
  [Types.UPDATE_DIRECTIONS_POLYLINE]: updateDirectionsPolyline,
  [Types.UPDATE_PROPS]: updateProps,
  [Types.UPDATE_SELECTED_STOP]: updateSelectedStop
});

export const deliveryStatus = (state) =>
  state.delivery[currentDay()]?.deliveryStatus;

export const hasItemsLeftToDeliver = (state) => {
  return checkAtLeastOneItem(
    state.delivery[currentDay()]?.stockWithData?.items
  );
};

export const itemCount = (state) =>
  state.delivery[currentDay()]?.stock?.length > 0
    ? state.delivery[currentDay()].stock.reduce(
        (ta, a) =>
          a.vehicleStockItems.reduce((ti, i) => i.quantity + ti, 0) + ta,
        0
      )
    : 0;

export const outOfStockItems = (state) =>
  state.delivery[currentDay()]?.outOfStockIds;

export const orderedStopsIds = (state) =>
  state.delivery[currentDay()]?.orderedStopsIds;

export const selectedStop = (state) => {
  const todaysDelivery = state.delivery[currentDay()];
  return todaysDelivery &&
    todaysDelivery.stops &&
    todaysDelivery.selectedStopId &&
    todaysDelivery.stops[todaysDelivery.selectedStopId]
    ? todaysDelivery.stops[todaysDelivery.selectedStopId]
    : null;
};

export const stops = (state) => state.delivery[currentDay()]?.stops;
