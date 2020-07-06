import { connect } from 'react-redux';

import { Creators as applicationActions } from '/process/reducers/application';

import Home from './view';

export default connect(
  (state) => ({
    processing: state.application.processing
  }),
  {
    login: applicationActions.login
  }
)(Home);
