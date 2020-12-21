import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueDetails from './view';

export default connect(
  (state) => {
    const today = state.delivery.currentDay;

    return {
      claims: state.delivery[today]?.claims,
      selectedIssue: state.application.lastRouteParams
    };
  },
  {
    toggleReplyModal: deliveryActions.toggleReplyModal
  }
)(CustomerIssueDetails);
