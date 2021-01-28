import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import RegistrationMileage from './view';

export default connect(
  (state) => ({
    payload: state.delivery?.checklist.payload
  }),
  {
    setMileage: deliveryActions.setMileage,
    setRegistration: deliveryActions.setRegistration
  }
)(RegistrationMileage);
