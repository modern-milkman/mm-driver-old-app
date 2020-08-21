import { createActions, createReducer } from 'reduxsauce';

import { checkAtLeastOneItem, currentDay, formatDate } from 'Helpers';
import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    getForDriver: null,
    getForDriverSuccess: ['payload'],
    getVehicleStockForDriver: null,
    getVehicleStockForDriverSuccess: ['payload', 'deliveryDate'],
    updateCurrentDayProps: ['props'],
    updateProps: ['props']
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
  proccessing: true,
  [formatDate(new Date())]: {
    groupedStock: {},
    hasRoutes: false,
    deliveryStatus: 3,
    stock: [],
    stockWithData: {}
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
    draft.proccessing = false;
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

export const itemCount = (state) =>
  state.delivery[currentDay()]?.stock?.length > 0
    ? state.delivery[currentDay()].stock.reduce(
        (ta, a) =>
          a.vehicleStockItems.reduce((ti, i) => i.quantity + ti, 0) + ta,
        0
      )
    : 0;

export const hasItemsLeftToDeliver = (state) => {
  return checkAtLeastOneItem(
    state.delivery[currentDay()]?.stockWithData?.items
  );
};

export const updateCurrentDayProps = (state, { props }) => {
  let cd = currentDay(); //This will need to change with the current day prop
  return { ...state, [cd]: { ...state[cd], ...props } };
};

export default createReducer(initialState, {
  [Types.GET_FOR_DRIVER_SUCCESS]: getForDriverSuccess,
  [Types.GET_VEHICLE_STOCK_FOR_DRIVER_SUCCESS]: getVehicleStockForDriverSuccess,
  [Types.UPDATE_CURRENT_DAY_PROPS]: updateCurrentDayProps,
  [Types.UPDATE_PROPS]: updateProps
});
