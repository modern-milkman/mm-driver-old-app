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
      checklist: currentChecklist,
      currentLocation: state.device.position,
      optimisedRouting: state.delivery?.optimisedRouting,
      selectedStop: currentSelectedStop,
      status: state.delivery?.status
    };
  },
  {
    continueDelivering: deliveryActions.continueDelivering,
    startDelivering: deliveryActions.startDelivering,
    updateDeliveryProps: deliveryActions.updateProps,
    setLocationHeading: deviceActions.setLocationHeading
  }
)(Main);
