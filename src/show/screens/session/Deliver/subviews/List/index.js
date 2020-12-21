import { connect } from 'react-redux';

import CustomerIssueList from './view';
import { selectedStop } from 'Reducers/delivery';

export default connect((state) => {
  const today = state.delivery.currentDay;

  return {
    claims: state.delivery[today]?.claims,
    selectedStop: selectedStop(state)
  };
}, {})(CustomerIssueList);
