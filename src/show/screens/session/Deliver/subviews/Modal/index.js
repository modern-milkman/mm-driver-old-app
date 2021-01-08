import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueModal from './view';

export default connect(
  (state) => {
    return {
      claims: state.delivery?.claims
    };
  },
  {
    acknowledgeClaim: deliveryActions.acknowledgeClaim,
    driverReply: deliveryActions.driverReply,
    toggleReplyModal: deliveryActions.toggleReplyModal,
    updateDriverResponse: deliveryActions.updateDriverResponse
  }
)(CustomerIssueModal);
