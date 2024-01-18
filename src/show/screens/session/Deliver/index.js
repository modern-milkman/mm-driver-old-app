import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as deliveryActions, selectedStop } from 'Reducers/delivery';

import Deliver from './view';

export default connect(
  state => {
    return {
      allItemsDone: state.delivery?.allItemsDone,
      buttonAccessibility: state.device.buttonAccessibility,
      selectedStop: selectedStop(state),
      confirmedItem: state.delivery?.confirmedItem,
      outOfStockIds: state.delivery?.outOfStockIds,
      podImage: state.delivery?.podImage,
      routeDescription: state.delivery?.stockWithData?.routeDescription,
      rejectReasons: state.delivery?.rejectReasons,
      ...state.transient
    };
  },
  {
    setDelivered: deliveryActions.setDelivered,
    setRejected: deliveryActions.setRejected,
    showPODRequired: deliveryActions.showPODRequired,
    toggleConfirmedItem: deliveryActions.toggleConfirmedItem,
    toggleModal: deliveryActions.toggleModal,
    toggleOutOfStock: deliveryActions.toggleOutOfStock,
    updateProps: deliveryActions.updateProps,
    updateTransientProps: transientActions.updateProps
  }
)(Deliver);
