import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';

import Reports from './view';

export default connect(
  (state) => {
    return {
      requestQueues: state.device.requestQueues,
      syncingData: state.device.processors.syncData
    };
  },
  {
    shareOfflineData: deviceActions.shareOfflineData,
    syncOffline: deviceActions.syncOffline
  }
)(Reports);
