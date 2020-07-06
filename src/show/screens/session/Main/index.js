import { connect } from 'react-redux';

import { Creators as applicationActions } from '/process/reducers/application';

import Main from './view';

export default connect(
  (state) => ({
    name: state.user.name
  }),
  {
    logout: applicationActions.logout
  }
)(Main);
