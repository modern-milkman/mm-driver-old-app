import { createActions, createReducer } from 'reduxsauce';

import { Point, solve as salesman } from 'Services/salesman';
import { checkAtLeastOneItem, currentDay, formatDate } from 'Helpers';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    getForDriver: null,
    getForDriverSuccess: ['payload'],
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: ['payload', 'deliveryDate'],
    optimizeStops: ['currentLocation', 'returnPosition'],
    startDelivering: null,
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
    groupedStock: {},
    hasRoutes: false,
    deliveryStatus: 3,
    directionsPolyline: [],
    stock: [],
    stockWithData: {},
    stops: {},
    orderedStopsIds: [],
    selectedStopId: null
  }
};

export const reset = () => initialState;

export const getVehicleStockForDriverSuccess = (
  state,
  { deliveryDate, payload }
) =>
  produce(state, (draft) => {
    const formatedDate = formatDate(new Date(deliveryDate));
    const groupedItems = payload.reduce((routeRes, route) => {
      route.vehicleStockItems.forEach((item) => {
        routeRes[item.category] = routeRes[item.category] || {};
        routeRes[item.category][item.productName] = routeRes[item.category][
          item.productName
        ] || {
          rightText: 0,
          title: item.productName,
          description: item.measureDescription
        };

        routeRes[item.category][item.productName] = {
          ...routeRes[item.category][item.productName],
          rightText:
            routeRes[item.category][item.productName]?.rightText + item.quantity
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
      ? 2
      : checkAtLeastOneItem(payload?.items, 1)
      ? 0
      : 3;
  });

export const startDelivering = (state) =>
  produce(state, (draft) => {
    const cd = currentDay();

    for (const item of state[cd].stockWithData.items) {
      const {
        address: { addressId, latitude, longitude }
      } = item;
      if (!draft[cd].stops[addressId]) {
        draft[cd].orderedStopsIds.push(addressId);
        draft[cd].stops[addressId] = {
          customerId: item.customerId,
          latitude,
          longitude,
          forename: item.forename,
          surname: item.surname,
          phoneNumber: item.phoneNumber,
          orders: []
        };
      }
      draft[cd].stops[addressId].orders.push(item);
    }
    draft[cd].processing = true;
    draft[cd].deliveryStatus = 2;
  });

export const optimizeStops = (state, { currentLocation, returnPosition }) =>
  produce(state, (draft) => {
    const cd = currentDay();
    const stops = [
      new Point(
        currentLocation.latitude,
        currentLocation.longitude,
        'CURRENT_LOCATION'
      )
    ];
    for (const addressId of state[cd].orderedStopsIds) {
      const item = state[cd].stops[addressId];
      stops.push(new Point(item.latitude, item.longitude, addressId));
    }
    if (returnPosition) {
      stops.push(
        new Point(
          returnPosition.latitude,
          returnPosition.longitude,
          'RETURN_LOCATION'
        )
      );
    }
    const hasDummy = stops.length > 2;

    if (hasDummy) {
      stops.push(new Point(0, 0)); //dummy TSP point
    }
    const optimizedRoute = salesman(stops, hasDummy);
    optimizedRoute.splice(0, 1);
    if (hasDummy) {
      optimizedRoute.splice(-1, 1);
    }
    if (returnPosition) {
      optimizedRoute.splice(-1, 1);
    }
    draft[cd].orderedStopsIds = [];
    optimizedRoute.map((i) => draft[cd].orderedStopsIds.push(stops[i].key));
    draft[cd].selectedStopId = draft[cd].orderedStopsIds[0];
    draft[cd].processing = false;
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
  [Types.START_DELIVERING]: startDelivering,
  [Types.UPDATE_CURRENT_DAY_PROPS]: updateCurrentDayProps,
  [Types.UPDATE_DIRECTIONS_POLYLINE]: updateDirectionsPolyline,
  [Types.UPDATE_PROPS]: updateProps,
  [Types.UPDATE_SELECTED_STOP]: updateSelectedStop
});

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

export const selectedStop = (state) => {
  const todaysDelivery = state.delivery[currentDay()];
  return todaysDelivery &&
    todaysDelivery.stops &&
    todaysDelivery.selectedStopId &&
    todaysDelivery.stops[todaysDelivery.selectedStopId]
    ? todaysDelivery.stops[todaysDelivery.selectedStopId]
    : null;
};
