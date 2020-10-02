import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import Map from './view';

export default connect(
  (state) => {
    const cd = state.delivery.currentDay;
    return {
      availableNavApps: state.device?.availableNavApps,
      buttonAccessibility: state.device.buttonAccessibility,
      completedStopsIds: state.delivery[cd]?.completedStopsIds,
      coords: state.device?.position?.coords,
      directionsPolyline: state.delivery[cd]?.directionsPolyline,
      mapMarkerSize: state.device.mapMarkerSize,
      orderedStopsIds: state.delivery[cd]?.orderedStopsIds,
      returnPosition: state.device.returnPosition,
      selectedStopId: state.delivery[cd]?.selectedStopId,
      showDoneDeliveries: state.device.showDoneDeliveries,
      stops: state.delivery[cd]?.stops
    };
  },
  {
    updateReturnPosition: deliveryActions.updateReturnPosition,
    updateSelectedStop: deliveryActions.updateSelectedStop
  }
)(Map);
