import { connect } from 'react-redux';

import Markers from './view';

export default connect((state) => {
  return {
    directionsPolyline: state.delivery?.directionsPolyline
  };
}, {})(Markers);
