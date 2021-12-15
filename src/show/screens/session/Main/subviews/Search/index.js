import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as transientActions } from 'Reducers/transient';
import {
  Creators as deliveryActions,
  orderedStopsIds
} from 'Reducers/delivery';

import Search from './view';

export default connect(
  state => {
    return {
      completedStopsIds: state.delivery?.completedStopsIds,
      isOptimised: state.delivery?.stockWithData?.isOptimised || false,
      optimisedRouting: state.delivery?.optimisedRouting,
      orderedStopsIds: orderedStopsIds(state),
      outOfSequenceIds: state.delivery?.outOfSequenceIds,
      searchValue: state.transient.searchValue,
      status: state.delivery?.status,
      stops: Object.values(state.delivery?.stops || {})
    };
  },
  {
    updateDeviceProps: deviceActions.updateProps,
    updateSelectedStop: deliveryActions.updateSelectedStop,
    updateTransientProps: transientActions.updateProps
  }
)(Search);
