import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Search from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;
    const stops = Object.values(state.delivery[today]?.stops || {});

    return {
      searchValue: state.transient.searchValue,
      stops,
      deliveryStatus: state.delivery[today]?.deliveryStatus
    };
  },
  {
    updateSelectedStop: deliveryActions.updateSelectedStop,
    updateTransientProps: transientActions.updateProps
  }
)(Search);
