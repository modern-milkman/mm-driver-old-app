import { connect } from 'react-redux';
import Config from 'react-native-config';

import { Creators as applicationActions } from 'Reducers/application';

import SideBar from './view';

export default connect(
  (state) => ({
    appcenter: state.device.appcenter,
    availableNavApps: state.device?.availableNavApps,
    deliveryStatus: state.delivery?.deliveryStatus,
    driverId: state.user.driverId,
    name: state.user.name,
    sideBarOpen: state.application.sideBarOpen,
    source: state.device?.position?.coords || {
      latitude: parseFloat(Config.DEFAULT_LATITUDE),
      longitude: parseFloat(Config.DEFAULT_LONGITUDE)
    }
  }),
  {
    updateProps: applicationActions.updateProps
  }
)(SideBar);
