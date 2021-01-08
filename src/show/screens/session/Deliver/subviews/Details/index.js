import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueDetails from './view';

export default connect(
  (state) => {
    return {
      claims: state.delivery?.claims,
      selectedIssue: state.application.lastRouteParams
    };
  },
  {
    toggleReplyModal: deliveryActions.toggleReplyModal
  }
)(CustomerIssueDetails);
