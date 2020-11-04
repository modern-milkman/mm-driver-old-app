import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import Markers from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;
    const selectedStopId = state.delivery[today]?.selectedStopId;

    return {
      availableNavApps: state.device?.availableNavApps,
      buttonAccessibility: state.device.buttonAccessibility,
      coords: state.device?.position?.coords,
      deliveryStatus: state.delivery[today]?.deliveryStatus,
      processing: state.delivery.processing,
      returnPosition: state.device.returnPosition,
      selectedStopId,
      stops: state.delivery[today]?.stops
    };
  },
  {
    refreshDriverData: deliveryActions.refreshDriverData,
    updateReturnPosition: deliveryActions.updateReturnPosition
  }
)(Markers);
