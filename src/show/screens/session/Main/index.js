import { connect } from 'react-redux';

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
      autoSelectStop: state.device.autoSelectStop,
      checklist: currentChecklist,
      currentLocation: state.device.position,
      isOptimised: state.delivery?.stockWithData?.isOptimised || false,
      selectedStop: currentSelectedStop,
      status: state.delivery?.status
    };
  },
  {
    continueDelivering: deliveryActions.continueDelivering,
    startDelivering: deliveryActions.startDelivering,
    updateDeviceProps: deviceActions.updateProps,
    setLocationHeading: deviceActions.setLocationHeading
  }
)(Main);
