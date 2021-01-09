import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as deliveryActions, selectedStop } from 'Reducers/delivery';

import Deliver from './view';

export default connect(
  (state) => {
    return {
      allItemsDone: state.delivery?.allItemsDone,
      selectedStop: selectedStop(state),
      claims: state.delivery?.claims,
      confirmedItem: state.delivery?.confirmedItem,
      outOfStock: state.delivery?.outOfStockIds,
      selectedStopId: state.delivery?.selectedStopId,
      routeDescription: state.delivery?.stockWithData?.routeDescription,
      ...state.transient
    };
  },
  {
    setDelivered: deliveryActions.setDelivered,
    setRejected: deliveryActions.setRejected,
    toggleConfirmedItem: deliveryActions.toggleConfirmedItem,
    toggleOutOfStock: deliveryActions.toggleOutOfStock,
    updateTransientProps: transientActions.updateProps
  }
)(Deliver);
