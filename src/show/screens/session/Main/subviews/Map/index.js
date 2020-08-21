import { connect } from 'react-redux';

import { currentDay } from 'Helpers';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Map from './view';

export default connect(
  (state) => {
    const cd = currentDay();
    return {
      availableNavApps: state.device?.availableNavApps,
      coords: state.device?.position?.coords,
      orderedStopsIds: state.delivery[cd].orderedStopsIds,
      selectedStopId: state.delivery[cd].selectedStopId,
      stops: state.delivery[cd].stops
    };
  },
  {
    updateSelectedStop: deliveryActions.updateSelectedStop
  }
)(Map);
