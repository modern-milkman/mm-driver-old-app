import { connect } from 'react-redux';

import Markers from './view';

export default connect((state) => {
  const today = state.delivery.currentDay;
  return {
    directionsPolyline: state.delivery[today]?.directionsPolyline
  };
}, {})(Markers);
