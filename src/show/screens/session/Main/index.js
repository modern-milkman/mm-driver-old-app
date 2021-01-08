import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions, selectedStop } from 'Reducers/delivery';

import Main from './view';

export default connect(
  (state) => {
    const currentSelectedStop = selectedStop(state);

    return {
      buttonAccessibility: state.device.buttonAccessibility,
      canPanForeground:
        (state.delivery?.hasRoutes &&
          state.delivery?.deliveryStatus !== 3 &&
          state.delivery.optimizedRoutes) ||
        (!state.delivery.optimizedRoutes && currentSelectedStop) ||
        (state.delivery?.deliveryStatus === 0 && state.delivery?.hasRoutes),
      currentLocation: state.device.position?.coords,
      deliveryStatus: state.delivery?.deliveryStatus,
      foregroundSize: state.device.foregroundSize,
      optimizedRoutes: state.delivery.optimizedRoutes,
      returnPosition: state.device.returnPosition,
      selectedStop: currentSelectedStop
    };
  },
  {
    optimizeStops: deliveryActions.optimizeStops,
    startDelivering: deliveryActions.startDelivering,
    updateDeviceProps: deviceActions.updateProps
  }
)(Main);
