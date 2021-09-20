import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions } from 'Reducers/delivery';
import { Creators as transientActions } from 'Reducers/transient';

import Search from './view';

export default connect(
  state => {
    return {
      searchValue: state.transient.searchValue,
      status: state.delivery?.status,
      completedStopsIds: state.delivery?.completedStopsIds,
      stops: Object.values(state.delivery?.stops || {})
    };
  },
  {
    updateDeviceProps: deviceActions.updateProps,
    updateProps: deliveryActions.updateProps,
    updateSelectedStop: deliveryActions.updateSelectedStop,
    updateTransientProps: transientActions.updateProps
  }
)(Search);
