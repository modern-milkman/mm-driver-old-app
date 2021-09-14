import { connect } from 'react-redux';

import { Creators as DeliveryActions } from 'Reducers/delivery';
import { Creators as ApplicationActions } from 'Reducers/application';

import CustomBackHandler from './view';

export default connect(
  state => ({
    lastRoute:
      state.application.stackRoute[state.application.stackRoute.length - 1],
    sideBarOpen: state.application.sideBarOpen
  }),
  {
    updateProps: ApplicationActions.updateProps,
    toggleModal: DeliveryActions.toggleModal
  }
)(CustomBackHandler);
