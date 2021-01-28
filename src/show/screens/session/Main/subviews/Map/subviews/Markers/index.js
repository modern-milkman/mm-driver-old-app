import { connect } from 'react-redux';

import Markers from './view';

export default connect((state) => {
  return {
    completedStopsIds: state.delivery?.completedStopsIds,
    mapMarkerSize: state.device.mapMarkerSize,
    orderedStopsIds: state.delivery?.orderedStopsIds,
    selectedStopId: state.delivery?.selectedStopId,
    showDoneDeliveries: state.device.showDoneDeliveries,
    status: state.delivery?.status
  };
}, {})(Markers);
