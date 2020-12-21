import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueModal from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;

    return {
      claims: state.delivery[today]?.claims
    };
  },
  {
    acknowledgeClaim: deliveryActions.acknowledgeClaim,
    driverReply: deliveryActions.driverReply,
    toggleReplyModal: deliveryActions.toggleReplyModal,
    updateDriverResponse: deliveryActions.updateDriverResponse
  }
)(CustomerIssueModal);
