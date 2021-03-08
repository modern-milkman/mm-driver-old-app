import { connect } from 'react-redux';

import { stopCount } from 'Reducers/delivery';
import { Creators as applicationActions } from 'Reducers/application';

import Navigation from './view';

export default connect(
  (state) => {
    return {
      completedStopsIds: state.delivery?.completedStopsIds,
      countDown: state.device.countDown,
      lowConnection: state.device.lowConnection,
      status: state.delivery?.status,
      stopCount: stopCount(state)
    };
  },
  {
    updateProps: applicationActions.updateProps
  }
)(Navigation);
