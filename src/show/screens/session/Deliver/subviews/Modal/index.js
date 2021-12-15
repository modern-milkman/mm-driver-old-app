import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';
import { Creators as transientActions } from 'Reducers/transient';

import CustomerIssueModal from './view';

export default connect(
  state => {
    const selectedStopId = state.delivery?.selectedStopId;

    return {
      cannedContent: state.delivery?.cannedContent,
      claims: state.delivery?.stops[selectedStopId]?.claims,
      driverResponse: { ...state.transient }
    };
  },
  {
    driverReply: deliveryActions.driverReply,
    toggleModal: deliveryActions.toggleModal,
    updateDriverResponse: transientActions.updateProps
  }
)(CustomerIssueModal);
