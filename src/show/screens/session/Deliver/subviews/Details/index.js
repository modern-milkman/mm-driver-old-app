import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueDetails from './view';

export default connect(
  (state) => {
    const selectedStopId = state.delivery?.selectedStopId;

    return {
      selectedClaim: state.delivery?.claims[selectedStopId]?.selectedClaim
    };
  },
  {
    toggleModal: deliveryActions.toggleModal
  }
)(CustomerIssueDetails);
