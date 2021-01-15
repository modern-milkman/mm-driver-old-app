import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';
import { Creators as transientActions } from 'Reducers/transient';

import Search from './view';

export default connect(
  (state) => {
    return {
      deliveryStatus: state.delivery?.deliveryStatus,
      searchValue: state.transient.searchValue,
      stops: Object.values(state.delivery?.stops || {})
    };
  },
  {
    updateSelectedStop: deliveryActions.updateSelectedStop,
    updateTransientProps: transientActions.updateProps
  }
)(Search);
