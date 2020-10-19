import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions } from 'Reducers/delivery';
import { Creators as applicationActions } from 'Reducers/application';

import Settings from './view';

export default connect(
  (state) => ({
    buttonAccessibility: state.device.buttonAccessibility,
    mapMarkerSize: state.device.mapMarkerSize,
    optimizedRoutes: state.delivery.optimizedRoutes,
    showDoneDeliveries: state.device.showDoneDeliveries,
    vibrate: state.device.vibrate
  }),
  {
    logout: applicationActions.logout,
    updateDeliveryProps: deliveryActions.updateProps,
    updateDeviceProps: deviceActions.updateProps
  }
)(Settings);
