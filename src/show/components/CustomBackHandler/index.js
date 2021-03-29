import { connect } from 'react-redux';

import {
  Creators as ApplicationActions,
  lastRoute
} from 'Reducers/application';

import CustomBackHandler from './view';

export default connect(
  (state) => ({
    lastRoute: lastRoute(state),
    sideBarOpen: state.application.sideBarOpen
  }),
  {
    updateProps: ApplicationActions.updateProps
  }
)(CustomBackHandler);
