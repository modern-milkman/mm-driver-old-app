import { connect } from 'react-redux';

import { Creators as DeliveryActions } from 'Reducers/delivery';

import CustomBackHandler from './view';

export default connect(
  state => ({
    lastRoute:
      state.application.stackRoute[state.application.stackRoute.length - 1]
  }),
  {
    toggleModal: DeliveryActions.toggleModal
  }
)(CustomBackHandler);
