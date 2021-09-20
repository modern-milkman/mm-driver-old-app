import { connect } from 'react-redux';

import { deliveryStates as DS } from 'Helpers';
import { Creators as deviceActions } from 'Reducers/device';
import {
  Creators as deliveryActions,
  checklist,
  selectedStop
} from 'Reducers/delivery';

import Main from './view';

export default connect(
  state => {
    const currentSelectedStop = selectedStop(state);
    const currentChecklist = checklist(state);

    return {
      buttonAccessibility: state.device.buttonAccessibility,
      canPanForeground:
        (state.delivery?.hasRoutes &&
          [DS.NCI, DS.LV, DS.SSC, DS.SEC].includes(state.delivery?.status)) ||
        (state.delivery?.status === DS.DEL && currentSelectedStop) ||
        (state.delivery?.status === DS.DELC &&
          !currentChecklist.shiftEndVanChecks),
      checklist: currentChecklist,
      currentLocation: state.device.position,
      foregroundSize: state.device.foregroundSize,
      optimisedRouting: state.delivery?.optimisedRouting,
      selectedStop: currentSelectedStop,
      status: state.delivery?.status
    };
  },
  {
    continueDelivering: deliveryActions.continueDelivering,
    startDelivering: deliveryActions.startDelivering,
    updateDeviceProps: deviceActions.updateProps
  }
)(Main);
