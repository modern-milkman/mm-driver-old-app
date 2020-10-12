import { connect } from 'react-redux';

import { Creators as deliveryActions, selectedStop } from 'Reducers/delivery';
import { Creators as transientActions } from 'Reducers/transient';

import Deliver from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;

    return {
      allItemsDone: state.delivery[today]?.allItemsDone,
      selectedStop: selectedStop(state),
      confirmedItem: state.delivery[today]?.confirmedItem,
      outOfStock: state.delivery[today]?.outOfStockIds,
      selectedStopId: state.delivery[today]?.selectedStopId,
      routeDescription: state.delivery[today]?.stockWithData?.routeDescription,
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
