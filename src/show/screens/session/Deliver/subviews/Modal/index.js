import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';
import { Creators as transientActions } from 'Reducers/transient';

import CustomerIssueModal from './view';

export default connect(
  (state) => {
    const selectedStopId = state.delivery?.selectedStopId;

    return {
      driverResponse: { ...state.transient },
      claims: state.delivery?.stops[selectedStopId].claims,
      productImages: state.device?.productImages
    };
  },
  {
    driverReply: deliveryActions.driverReply,
    toggleReplyModal: deliveryActions.toggleReplyModal,
    updateDriverResponse: transientActions.updateProps
  }
)(CustomerIssueModal);
