import { connect } from 'react-redux';

import { Creators as deliveryActions, checklist } from 'Reducers/delivery';
import { Creators as transientActions } from 'Reducers/transient';

import RegistrationMileage from './view';

export default connect(
  state => ({
    payload: checklist(state)?.payload,
    registrationPlates: state.delivery.registrationPlates,
    ...state.transient
  }),
  {
    setMileage: deliveryActions.setMileage,
    setValidNumberPlate: deliveryActions.setValidNumberPlate,
    setRegistration: deliveryActions.setRegistration,
    updateTransientProps: transientActions.updateProps
  }
)(RegistrationMileage);
