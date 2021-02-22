import { connect } from 'react-redux';
import Config from 'react-native-config';

import { Creators as applicationActions } from 'Reducers/application';

import SideBar from './view';

export default connect(
  (state) => ({
    appcenter: state.device.appcenter,
    availableNavApps: state.device?.availableNavApps,
    driverId: state.user.driverId,
    name: state.user.name,
    sideBarOpen: state.application.sideBarOpen,
    source: state.device?.position || {
      latitude: parseFloat(Config.DEFAULT_LATITUDE),
      longitude: parseFloat(Config.DEFAULT_LONGITUDE)
    },
    status: state.delivery?.status
  }),
  {
    updateProps: applicationActions.updateProps
  }
)(SideBar);
