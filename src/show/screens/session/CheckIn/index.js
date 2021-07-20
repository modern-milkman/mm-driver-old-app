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
    itemCount: itemCount(state),
    status: state.delivery?.status,
    checklist: checklist(state),
    stopCount: stopCount(state)
  }),
  {
    startDelivering: deliveryActions.startDelivering
  }
)(Main);
