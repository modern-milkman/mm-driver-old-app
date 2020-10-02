import { connect } from 'react-redux';

import { stopCount } from 'Reducers/delivery';
import { Creators as applicationActions } from 'Reducers/application';

import Navigation from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;

    return {
      completedStopsIds: state.delivery[today]?.completedStopsIds,
      deliveryStatus: state.delivery[today]?.deliveryStatus,
      stopCount: stopCount(state)
    };
  },
  {
    updateProps: applicationActions.updateProps
  }
)(Navigation);
