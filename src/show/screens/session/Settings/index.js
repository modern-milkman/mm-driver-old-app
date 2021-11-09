import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions, checklist } from 'Reducers/delivery';
import { Creators as applicationActions } from 'Reducers/application';

import Settings from './view';

export default connect(
  state => ({
    biometrics: state.device.biometrics,
    buttonAccessibility: state.device.buttonAccessibility,
    checklist: checklist(state),
    computeDirections: state.device.computeDirections,
    computeShortDirections: state.device.computeShortDirections,
    countDown: state.device.countDown,
    currentLocation: state.device.position,
    foregroundSize: state.device.foregroundSize,
    isOptimised: state.delivery?.stockWithData?.isOptimised || false,
    mapMarkerSize: state.device.mapMarkerSize,
    optimisedRouting: state.delivery?.optimisedRouting,
    network: state.device.network,
    showDoneDeliveries: state.device.showDoneDeliveries,
    showMapControlsOnMovement: state.device.showMapControlsOnMovement,
    status: state.delivery?.status,
    vibrate: state.device.vibrate
  }),
  {
    biometricDisable: applicationActions.biometricDisable,
    logout: applicationActions.logout,
    continueDelivering: deliveryActions.continueDelivering,
    updateDeliveryProps: deliveryActions.updateProps,
    updateDeviceProps: deviceActions.updateProps
  }
)(Settings);
