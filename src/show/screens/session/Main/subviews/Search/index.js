import { connect } from 'react-redux';

import { currentDay } from 'Helpers';
import { Creators as transientActions } from 'Reducers/transient';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Search from './view';

export default connect(
  (state) => {
    const stops = Object.values(state.delivery[currentDay()]?.stops);
    return {
      stops: stops.length > 0,
      focused: state.transient.focused,
      searchValue: state.transient.searchValue,
      itemsToSearch: stops
    };
  },
  {
    updateTransientProps: transientActions.updateProps,
    updateSelectedStop: deliveryActions.updateSelectedStop
  }
)(Search);
