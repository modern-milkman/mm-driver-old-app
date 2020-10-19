import { connect } from 'react-redux';

import Markers from './view';

export default connect((state) => {
  const today = state.delivery.currentDay;
  return {
    completedStopsIds: state.delivery[today]?.completedStopsIds,
    deliveryStatus: state.delivery[today]?.deliveryStatus,
    mapMarkerSize: state.device.mapMarkerSize,
    orderedStopsIds: state.delivery[today]?.orderedStopsIds,
    selectedStopId: state.delivery[today]?.selectedStopId,
    showDoneDeliveries: state.device.showDoneDeliveries
  };
}, {})(Markers);
