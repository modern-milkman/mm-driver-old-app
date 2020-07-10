import { connect } from 'react-redux';

import { Creators as applicationActions } from 'Reducers/application';

import SideBar from './view';

export default connect(
  (state) => ({
    name: state.user.name,
    visible: state.application.sideBarOpen
  }),
  {
    updateProps: applicationActions.updateProps
  }
)(SideBar);
