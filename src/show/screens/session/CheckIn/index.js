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
    checklist: checklist(state),
    itemCount: itemCount(state),
    optimisedRouting: state.delivery?.optimisedRouting,
    status: state.delivery?.status,
    stopCount: stopCount(state)
  }),
  {
    continueDelivering: deliveryActions.continueDelivering,
    startDelivering: deliveryActions.startDelivering
  }
)(Main);
