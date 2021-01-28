import { connect } from 'react-redux';

import {
  itemCount,
  Creators as deliveryActions,
  stopCount
} from 'Reducers/delivery';

import Main from './view';

export default connect(
  (state) => ({
    itemCount: itemCount(state),
    status: state.delivery?.status,
    checklist: state.delivery?.checklist,
    stopCount: stopCount(state)
  }),
  {
    startDelivering: deliveryActions.startDelivering
  }
)(Main);
