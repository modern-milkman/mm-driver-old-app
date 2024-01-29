import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';

import Camera from './view';

export default connect(
  state => {
    return {
      buttonAccessibility: state.device.buttonAccessibility,
      flashModeIndex: state.device.flashModeIndex
    };
  },
  {
    updateProps: deviceActions.updateProps
  }
)(Camera);
