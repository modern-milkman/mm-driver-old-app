import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';
import { Creators as transientActions } from 'Reducers/transient';

import RegistrationMileage from './view';

export default connect(
  (state) => ({
    payload: state.delivery?.checklist.payload,
    ...state.transient
  }),
  {
    setMileage: deliveryActions.setMileage,
    setRegistration: deliveryActions.setRegistration,
    updateTransientProps: transientActions.updateProps
  }
)(RegistrationMileage);
