import { connect } from 'react-redux';

import Reports from './view';

export default connect((state) => {
  return {
    network: state.device.network
  };
}, {})(Reports);
