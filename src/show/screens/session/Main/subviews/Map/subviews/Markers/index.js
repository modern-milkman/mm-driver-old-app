import { connect } from 'react-redux';

import Markers from './view';
import { orderedStopsIds } from 'Reducers/delivery';

export default connect(state => {
  return {
    completedStopsIds: state.delivery?.completedStopsIds,
    isOptimised: state.delivery?.stockWithData?.isOptimised || false,
    mapMarkerSize: state.device.mapMarkerSize,
    optimisedStopsToShow: state.device.optimisedStopsToShow,
    orderedStopsIds: orderedStopsIds(state),
    outOfSequenceIds: state.delivery?.outOfSequenceIds,
    selectedStopId: state.delivery?.selectedStopId,
    showAllPendingStops: state.device.showAllPendingStops,
    showDoneDeliveries: state.device.showDoneDeliveries,
    status: state.delivery?.status
  };
}, {})(Markers);
