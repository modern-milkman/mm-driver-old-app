import { connect } from 'react-redux';

import { Creators as deliveryActions, selectedStop } from 'Reducers/delivery';

import Main from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;
    const currentSelectedStop = selectedStop(state);

    return {
      buttonAccessibility: state.device.buttonAccessibility,
      canPanForeground:
        (state.delivery[today]?.hasRoutes &&
          state.delivery[today]?.deliveryStatus !== 3 &&
          state.delivery.optimizedRoutes) ||
        (!state.delivery.optimizedRoutes && currentSelectedStop) ||
        (state.delivery[today]?.deliveryStatus === 0 &&
          state.delivery[today]?.hasRoutes),
      currentLocation: state.device.position?.coords,
      deliveryStatus: state.delivery[today]?.deliveryStatus,
      optimizedRoutes: state.delivery.optimizedRoutes,
      returnPosition: state.device.returnPosition,
      selectedStop: currentSelectedStop
    };
  },
  {
    optimizeStops: deliveryActions.optimizeStops,
    startDelivering: deliveryActions.startDelivering
  }
)(Main);
