import { connect } from 'react-redux';

import {
  Creators as deliveryActions,
  checklist,
  itemCount,
  stopCount
} from 'Reducers/delivery';

import Main from './view';

export default connect(
  state => ({
    autoSelectStop: state.device.autoSelectStop,
    checklist: checklist(state),
    itemCount: itemCount(state),
    isOptimised: state.delivery?.stockWithData?.isOptimised || false,
    status: state.delivery?.status,
    stopCount: stopCount(state)
  }),
  {
    continueDelivering: deliveryActions.continueDelivering,
    startDelivering: deliveryActions.startDelivering
  }
)(Main);
