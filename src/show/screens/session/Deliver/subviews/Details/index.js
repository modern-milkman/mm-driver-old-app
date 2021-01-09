import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueDetails from './view';

export default connect(
  (state) => {
    return {
      selectedClaim: state.delivery?.claims?.selectedClaim
    };
  },
  {
    toggleReplyModal: deliveryActions.toggleReplyModal
  }
)(CustomerIssueDetails);
