import { connect } from 'react-redux';

import { selectedStop, Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueList from './view';

export default connect(
  (state) => {
    const selectedStopId = state.delivery?.selectedStopId;

    return {
      claims: state.delivery?.claims[selectedStopId],
      selectedStop: selectedStop(state)
    };
  },
  {
    setSelectedClaim: deliveryActions.redirectSetSelectedClaim
  }
)(CustomerIssueList);
