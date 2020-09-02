import { connect } from 'react-redux';

import { currentDay } from 'Helpers';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Map from './view';

export default connect(
  (state) => {
    const cd = currentDay();
    return {
      availableNavApps: state.device?.availableNavApps,
      completedStopsIds: state.delivery[cd]?.completedStopsIds,
      coords: state.device?.position?.coords,
      directionsPolyline: state.delivery[cd]?.directionsPolyline,
      orderedStopsIds: state.delivery[cd]?.orderedStopsIds,
      selectedStopId: state.delivery[cd]?.selectedStopId,
      stops: state.delivery[cd]?.stops
    };
  },
  {
    updateReturnPosition: deliveryActions.updateReturnPosition,
    updateSelectedStop: deliveryActions.updateSelectedStop
  }
)(Map);
