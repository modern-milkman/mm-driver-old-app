import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import Marker from './view';

export default connect(
  state => {
    return {
      completedStopsIds: state.delivery?.completedStopsIds,
      darkMode: state.device?.darkMode,
      mapMarkerSize: state.device.mapMarkerSize,
      previousStopId: state.delivery?.previousStopId,
      selectedStopId: state.delivery?.selectedStopId,
      stops: state.delivery?.stops
    };
  },
  {
    updateProps: deliveryActions.updateProps,
    updateSelectedStop: deliveryActions.updateSelectedStop
  }
)(Marker);
