import { connect } from 'react-redux';

import { Creators as applicationActions } from 'Reducers/application';

import SideBar from './view';

export default connect(
  (state) => ({
    driverId: state.user.driverId,
    name: state.user.name,
    sideBarOpen: state.application.sideBarOpen
  }),
  {
    updateProps: applicationActions.updateProps
  }
)(SideBar);
