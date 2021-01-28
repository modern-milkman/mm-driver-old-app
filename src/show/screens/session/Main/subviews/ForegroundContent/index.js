import { connect } from 'react-redux';

import { stopCount } from 'Reducers/delivery';

import ForegroundContent from './view';

export default connect((state) => {
  const selectedStopId = state.delivery?.selectedStopId;

  return {
    checklist: state.delivery?.checklist,
    foregroundSize: state.device.foregroundSize,
    optimizedRoutes: state.delivery.optimizedRoutes,
    processing: state.delivery.processing,
    resetHourDay: state.device.resetHourDay,
    routeDescription: state.delivery?.stockWithData?.routeDescription || null,
    selectedStop: state.delivery?.stops[selectedStopId] || null,
    status: state.delivery?.status,
    stopCount: stopCount(state)
  };
}, {})(ForegroundContent);
