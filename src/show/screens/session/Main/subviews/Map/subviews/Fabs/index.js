import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import Markers from './view';

export default connect(
  (state) => {
    return {
      availableNavApps: state.device?.availableNavApps,
      buttonAccessibility: state.device.buttonAccessibility,
      coords: state.device?.position?.coords,
      status: state.delivery?.status,
      processing: state.delivery.processing,
      returnPosition: state.device.returnPosition,
      selectedStopId: state.delivery?.selectedStopId,
      stops: state.delivery?.stops
    };
  },
  {
    refreshDriverData: deliveryActions.refreshDriverData,
    updateReturnPosition: deliveryActions.updateReturnPosition
  }
)(Markers);
