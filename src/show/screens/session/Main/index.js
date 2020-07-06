import { connect } from 'react-redux';

import { Creators as applicationActions } from '/process/reducers/application';

import Main from './view';

export default connect(null, {
  logout: applicationActions.logout
})(Main);
