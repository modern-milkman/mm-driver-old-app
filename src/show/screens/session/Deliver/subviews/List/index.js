import { connect } from 'react-redux';

import CustomerIssueList from './view';
import { selectedStop } from 'Reducers/delivery';

export default connect((state) => {
  return {
    claims: state.delivery?.claims,
    selectedStop: selectedStop(state)
  };
}, {})(CustomerIssueList);
