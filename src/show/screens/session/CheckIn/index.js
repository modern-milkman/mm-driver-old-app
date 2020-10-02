import { connect } from 'react-redux';

import { itemCount, Creators as deliveryActions } from 'Reducers/delivery';

import Main from './view';

export default connect(
  (state) => ({
    availableNavApps: state.device?.availableNavApps,
    itemCount: itemCount(state),
    deliveryStatus: state.delivery[state.delivery.currentDay]?.deliveryStatus
  }),
  { startDelivering: deliveryActions.startDelivering }
)(Main);
