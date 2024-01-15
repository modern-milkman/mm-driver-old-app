import { connect } from 'react-redux';

import Camera from './view';

export default connect(state => {
  return {
    buttonAccessibility: state.device.buttonAccessibility
  };
}, {})(Camera);
