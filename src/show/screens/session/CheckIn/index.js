import { connect } from 'react-redux';

import {
  Creators as deliveryActions,
  barcodeItemCount,
  checklist,
  itemCount,
  stopCount,
  TPLItemCount
} from 'Reducers/delivery';

import Main from './view';

export default connect(
  state => ({
    autoSelectStop: state.device.autoSelectStop,
    barcodeItemCount: barcodeItemCount(state),
    checklist: checklist(state),
    itemCount: itemCount(state),
    isOptimised: state.delivery?.stockWithData?.isOptimised || false,
    status: state.delivery?.status,
    stopCount: stopCount(state),
    TPLItemCount: TPLItemCount(state)
  }),
  {
    continueDelivering: deliveryActions.continueDelivering,
    resetChecklistPayload: deliveryActions.resetChecklistPayload,
    startDelivering: deliveryActions.startDelivering,
    updateDeliveryProps: deliveryActions.updateProps
  }
)(Main);
