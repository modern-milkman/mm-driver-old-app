import { connect } from 'react-redux';

import { deliveryStates as DS } from 'Helpers';
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
          state.delivery?.status !== DS.DELC &&
          state.delivery.optimizedRoutes) ||
        (!state.delivery.optimizedRoutes && currentSelectedStop) ||
        ([DS.NCI, DS.LV, DS.SSC, DS.DELC, DS.SEC].includes(
          state.delivery?.status
        ) &&
          state.delivery?.hasRoutes),
      checklist: state.delivery?.checklist,
      currentLocation: state.device.position?.coords,
      foregroundSize: state.device.foregroundSize,
      optimizedRoutes: state.delivery.optimizedRoutes,
      returnPosition: state.device.returnPosition,
      selectedStop: currentSelectedStop,
      status: state.delivery?.status
    };
  },
  {
    optimizeStops: deliveryActions.optimizeStops,
    startDelivering: deliveryActions.startDelivering,
    updateDeviceProps: deviceActions.updateProps
  }
)(Main);
