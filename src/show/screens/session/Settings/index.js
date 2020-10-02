import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as applicationActions } from 'Reducers/application';

import Settings from './view';

export default connect(
  (state) => ({
    buttonAccessibility: state.device.buttonAccessibility,
    mapMarkerSize: state.device.mapMarkerSize,
    showDoneDeliveries: state.device.showDoneDeliveries,
    vibrate: state.device.vibrate
  }),
  {
    logout: applicationActions.logout,
    updateDeviceProps: deviceActions.updateProps
  }
)(Settings);
