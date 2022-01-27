import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as transientActions } from 'Reducers/transient';
import { Creators as applicationActions } from 'Reducers/application';

import Home from './view';

export default connect(
  state => ({
    biometrics: state.device.biometrics,
    country: state.device.country,
    network: state.device.network,
    processing: state.application.processing,
    rememberMe: state.device.rememberMe,
    ...state.transient
  }),
  {
    biometricLogin: applicationActions.biometricLogin,
    login: applicationActions.login,
    setCountry: deviceActions.setCountry,
    updateApplicationProps: applicationActions.updateProps,
    updateDeviceProps: deviceActions.updateProps,
    updateTransientProps: transientActions.updateProps
  }
)(Home);
