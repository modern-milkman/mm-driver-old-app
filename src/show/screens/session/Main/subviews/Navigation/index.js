import { connect } from 'react-redux';

import { stopCount } from 'Reducers/delivery';

import Navigation from './view';

export default connect(state => {
  return {
    completedStopsIds: state.delivery?.completedStopsIds,
    countDown: state.device.countDown,
    lowConnection: state.device.lowConnection,
    network: state.device.network,
    requestQueues: state.device.requestQueues,
    status: state.delivery?.status,
    stopCount: stopCount(state)
  };
}, {})(Navigation);
