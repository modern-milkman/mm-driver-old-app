import { connect } from 'react-redux';

import { stopCount } from 'Reducers/delivery';
import { Creators as applicationActions } from 'Reducers/application';

import Navigation from './view';

export default connect(
  (state) => {
    return {
      completedStopsIds: state.delivery?.completedStopsIds,
      deliveryStatus: state.delivery?.deliveryStatus,
      stopCount: stopCount(state)
    };
  },
  {
    updateProps: applicationActions.updateProps
  }
)(Navigation);
