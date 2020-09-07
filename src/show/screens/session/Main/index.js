import { connect } from 'react-redux';

import { currentDay } from 'Helpers';

import {
  hasItemsLeftToDeliver,
  Creators as deliveryActions
} from 'Reducers/delivery';

import Main from './view';

export default connect(
  (state) => {
    const today = currentDay();
    const selectedStopId = state.delivery[today]?.selectedStopId;

    return {
      deliveryStatus: state.delivery[today]?.deliveryStatus,
      hasItemsLeftToDeliver: hasItemsLeftToDeliver(state),
      hasRoutes: state.delivery[today]?.hasRoutes,
      itemCount: state.delivery[today]?.stockWithData?.itemCount,
      processing: state.delivery.processing,
      routeDescription: state.delivery[today]?.stockWithData?.routeDescription,
      selectedStop: state.delivery[today]?.stops[selectedStopId]
    };
  },
  { startDelivering: deliveryActions.startDelivering }
)(Main);
