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
        (!state.delivery.optimizedRoutes && currentSelectedStop),
      deliveryStatus: state.delivery[today]?.deliveryStatus,
      selectedStop: currentSelectedStop,
      optimizedRoutes: state.delivery.optimizedRoutes
    };
  },
  {
    optimizeStops: deliveryActions.optimizeStops,
    startDelivering: deliveryActions.startDelivering
  }
)(Main);
