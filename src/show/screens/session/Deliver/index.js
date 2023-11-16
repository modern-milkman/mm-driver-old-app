import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as deliveryActions, selectedStop } from 'Reducers/delivery';

import Deliver from './view';

export default connect(
  state => {
    return {
      allItemsDone: state.delivery?.allItemsDone,
      bundledProducts: state.delivery.bundledProducts,
      buttonAccessibility: state.device.buttonAccessibility,
      confirmedItem: state.delivery?.confirmedItem,
      outOfStockIds: state.delivery?.outOfStockIds,
      podImage: state.delivery?.podImage,
      rejectReasons: state.delivery?.rejectReasons,
      routeDescription: state.delivery?.stockWithData?.routeDescription,
      selectedStop: selectedStop(state),
      ...state.transient
    };
  },
  {
    scanExternalReference: deliveryActions.scanExternalReference,
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
