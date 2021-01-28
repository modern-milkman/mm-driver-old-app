import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import Checklist from './view';

export default connect(
  (state) => ({
    payload: state.delivery?.checklist.payload,
    processing: state.delivery?.processing
  }),
  {
    saveVehicleChecks: deliveryActions.saveVehicleChecks,
    showMustComplyWithTerms: deliveryActions.showMustComplyWithTerms,
    toggleCheckJson: deliveryActions.toggleCheckJson
  }
)(Checklist);
