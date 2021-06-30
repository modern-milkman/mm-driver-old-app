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
      stops: Object.values(state.delivery?.stops || {})
    };
  },
  {
    centerSelectedStop: deliveryActions.centerSelectedStop,
    updateDeviceProps: deviceActions.updateProps,
    updateSelectedStop: deliveryActions.updateSelectedStop,
    updateTransientProps: transientActions.updateProps
  }
)(Search);
