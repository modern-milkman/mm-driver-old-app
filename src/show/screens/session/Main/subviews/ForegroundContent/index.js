import { connect } from 'react-redux';

import {
  Creators as deliveryActions,
  checklist,
  stopCount
} from 'Reducers/delivery';

import ForegroundContent from './view';

export default connect(
  state => {
    const selectedStopId = state.delivery?.selectedStopId;

    return {
      buttonAccessibility: state.device.buttonAccessibility,
      checklist: checklist(state),
      foregroundSize: state.device.foregroundSize,
      isOptimised: state.delivery?.stockWithData?.isOptimised || false,
      loaderInfo: state.delivery.loaderInfo,
      processing: state.delivery.processing,
      resetHourDay: state.device.resetHourDay,
      routeDescription: state.delivery?.stockWithData?.routeDescription || null,
      selectedStop: state.delivery?.stops[selectedStopId] || null,
      selectedStopId: state.delivery?.selectedStopId,
      status: state.delivery?.status,
      stopCount: stopCount(state)
    };
  },
  {
    deliverLater: deliveryActions.deliverLater
  }
)(ForegroundContent);
