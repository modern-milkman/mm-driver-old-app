import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import CustomerIssueDetails from './view';

export default connect(
  (state) => {
    const selectedStopId = state.delivery?.selectedStopId;
    const selectedStop = state.delivery?.stops[selectedStopId];

    return {
      selectedClaim: selectedStop?.claims.acknowledgedList.filter(
        (claim) => claim.claimId === selectedStop.claims.selectedClaimId
      )[0]
    };
  },
  {
    toggleModal: deliveryActions.toggleModal
  }
)(CustomerIssueDetails);
