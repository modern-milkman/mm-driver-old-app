import { connect } from 'react-redux';

import { Creators as deliveryActions, checklist } from 'Reducers/delivery';

import Checklist from './view';

export default connect(
  state => ({
    payload: checklist(state)?.payload,
    processing: state.delivery?.processing
  }),
  {
    saveVehicleChecks: deliveryActions.saveVehicleChecks,
    showMustComplyWithTerms: deliveryActions.showMustComplyWithTerms,
    toggleCheckJson: deliveryActions.toggleCheckJson
  }
)(Checklist);
