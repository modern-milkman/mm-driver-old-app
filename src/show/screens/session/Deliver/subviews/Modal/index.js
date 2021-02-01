import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueModal from './view';

export default connect(
  (state) => {
    const selectedStopId = state.delivery?.selectedStopId;

    return {
      claims: state.delivery?.claims[selectedStopId],
      processing: state.delivery?.claims.processing,
      showClaimModal: state.delivery?.claims.showClaimModal,
      showReplyModal: state.delivery?.claims.showReplyModal
    };
  },
  {
    driverReply: deliveryActions.driverReply,
    toggleReplyModal: deliveryActions.toggleReplyModal,
    updateDriverResponse: deliveryActions.updateDriverResponse
  }
)(CustomerIssueModal);
