import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as transientActions } from 'Reducers/transient';
import { Creators as applicationActions } from 'Reducers/application';

import Home from './view';

export default connect(
  state => ({
    network: state.device.network,
    processing: state.application.processing,
    rememberMe: state.device.rememberMe,
    biometrics: state.device.biometrics,
    ...state.transient
  }),
  {
    biometricLogin: applicationActions.biometricLogin,
    login: applicationActions.login,
    updateApplicationProps: applicationActions.updateProps,
    updateDeviceProps: deviceActions.updateProps,
    updateTransientProps: transientActions.updateProps
  }
)(Home);
