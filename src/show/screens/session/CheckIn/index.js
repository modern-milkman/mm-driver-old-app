import { connect } from 'react-redux';

import { currentDay } from 'Helpers';
import { itemCount } from 'Reducers/delivery';

import Main from './view';

export default connect(
  (state) => ({
    availableNavApps: state.device?.availableNavApps,
    itemCount: itemCount(state),
    deliveryStatus: state.delivery[currentDay()]?.deliveryStatus
  }),
  {}
)(Main);
