import { connect } from 'react-redux';

import { currentDay } from 'Helpers';

import { hasItemsLeftToDeliver } from 'Reducers/delivery';
import Main from './view';

export default connect((state) => {
  const currDay = currentDay();
  return {
    hasItemsLeftToDeliver: hasItemsLeftToDeliver(state),
    hasRoutes: state.delivery[currDay]?.hasRoutes,
    itemCount: state.delivery[currDay]?.stockWithData?.itemCount,
    routeDescription: state.delivery[currDay]?.stockWithData?.routeDescription,
    deliveryStatus: state.delivery[currDay]?.deliveryStatus
  };
}, {})(Main);
