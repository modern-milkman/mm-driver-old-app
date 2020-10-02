import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Search from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;
    const stops = Object.values(state.delivery[today]?.stops || {});
    const selectedStopId = state.delivery[today]?.selectedStopId;

    return {
      searchValue: state.transient.searchValue,
      selectedStopId,
      stops
    };
  },
  {
    updateSelectedStop: deliveryActions.updateSelectedStop,
    updateTransientProps: transientActions.updateProps
  }
)(Search);
