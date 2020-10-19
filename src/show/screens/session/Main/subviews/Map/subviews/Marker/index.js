import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import Marker from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;
    const selectedStopId = state.delivery[today]?.selectedStopId;

    return {
      completedStopsIds: state.delivery[today]?.completedStopsIds,
      mapMarkerSize: state.device.mapMarkerSize,
      previousStopId: state.delivery[today]?.previousStopId,
      stops: state.delivery[today]?.stops,
      selectedStopId
    };
  },
  {
    updateSelectedStop: deliveryActions.updateSelectedStop
  }
)(Marker);
