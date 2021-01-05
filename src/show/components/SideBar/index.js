import { connect } from 'react-redux';

import { Creators as applicationActions } from 'Reducers/application';

import SideBar from './view';

export default connect(
  (state) => ({
    appcenter: state.device.appcenter,
    availableNavApps: state.device?.availableNavApps,
    deliveryStatus: state.delivery[state.delivery.currentDay]?.deliveryStatus,
    driverId: state.user.driverId,
    name: state.user.name,
    sideBarOpen: state.application.sideBarOpen,
    source: state.device?.position?.coords
  }),
  {
    updateProps: applicationActions.updateProps
  }
)(SideBar);
