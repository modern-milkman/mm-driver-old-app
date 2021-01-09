import { connect } from 'react-redux';

import { selectedStop, Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueList from './view';

export default connect(
  (state) => {
    return {
      claims: state.delivery?.claims,
      selectedStop: selectedStop(state)
    };
  },
  {
    setSelectedClaim: deliveryActions.redirectSetSelectedClaim
  }
)(CustomerIssueList);
