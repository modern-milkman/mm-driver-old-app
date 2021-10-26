import { connect } from 'react-redux';

import Markers from './view';
import { orderedStopsIds } from 'Reducers/delivery';

export default connect(state => {
  return {
    completedStopsIds: state.delivery?.completedStopsIds,
    mapMarkerSize: state.device.mapMarkerSize,
    optimisedRouting: state.delivery?.optimisedRouting,
    orderedStopsIds: orderedStopsIds(state),
    selectedStopId: state.delivery?.selectedStopId,
    showDoneDeliveries: state.device.showDoneDeliveries,
    status: state.delivery?.status
  };
}, {})(Markers);
