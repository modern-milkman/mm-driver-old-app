import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions } from 'Reducers/delivery';
import { Creators as applicationActions } from 'Reducers/application';

import Settings from './view';

export default connect(
  (state) => ({
    buttonAccessibility: state.device.buttonAccessibility,
    currentLocation: state.device.position?.coords,
    foregroundSize: state.device.foregroundSize,
    mapMarkerSize: state.device.mapMarkerSize,
    optimizedRoutes: state.delivery.optimizedRoutes,
    returnPosition: state.device.returnPosition,
    showDoneDeliveries: state.device.showDoneDeliveries,
    showMapControlsOnMovement: state.device.showMapControlsOnMovement,
    vibrate: state.device.vibrate
  }),
  {
    logout: applicationActions.logout,
    optimizeStops: deliveryActions.optimizeStops,
    updateDeliveryProps: deliveryActions.updateProps,
    updateDeviceProps: deviceActions.updateProps
  }
)(Settings);
