import { connect } from 'react-redux';

import { Creators as applicationActions } from 'Reducers/application';
import { Creators as transientActions } from 'Reducers/transient';

import Home from './view';

export default connect(
  (state) => ({
    processing: state.application.processing,
    network: state.device.network,
    ...state.transient
  }),
  {
    login: applicationActions.login,
    updateApplicationProps: applicationActions.updateProps,
    updateTransientProps: transientActions.updateProps
  }
)(Home);
