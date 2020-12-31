import { connect } from 'react-redux';

import { stopCount } from 'Reducers/delivery';

import ForegroundContent from './view';

export default connect((state) => {
  const today = state.delivery.currentDay;
  const selectedStopId = state.delivery[today]?.selectedStopId;

  return {
    deliveryStatus: state.delivery[today]?.deliveryStatus,
    foregroundSize: state.device.foregroundSize,
    optimizedRoutes: state.delivery.optimizedRoutes,
    processing: state.delivery.processing,
    resetHourDay: state.device.resetHourDay,
    routeDescription:
      state.delivery[today]?.stockWithData?.routeDescription || null,
    selectedStop: state.delivery[today]?.stops[selectedStopId] || null,
    stopCount: stopCount(state)
  };
}, {})(ForegroundContent);
