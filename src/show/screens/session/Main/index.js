import { connect } from 'react-redux';

import { Creators as deliveryActions, selectedStop } from 'Reducers/delivery';

import Main from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;

    return {
      buttonAccessibility: state.device.buttonAccessibility,
      canPanForeground:
        state.delivery[today]?.hasRoutes &&
        state.delivery[today]?.deliveryStatus !== 3,
      deliveryStatus: state.delivery[today]?.deliveryStatus,
      selectedStop: selectedStop(state),
      optimizedRoutes: state.delivery.optimizedRoutes
    };
  },
  {
    optimizeStops: deliveryActions.optimizeStops,
    startDelivering: deliveryActions.startDelivering
  }
)(Main);
