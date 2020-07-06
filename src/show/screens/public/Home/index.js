import { connect } from 'react-redux';

import { Creators as applicationActions } from '/process/reducers/application';
import { Creators as transientActions } from '/process/reducers/transient';

import Home from './view';

export default connect(
  (state) => ({
    processing: state.application.processing,
    ...state.transient
  }),
  {
    login: applicationActions.login,
    updateProps: applicationActions.updateProps,
    updateTransientProps: transientActions.updateProps
  }
)(Home);
