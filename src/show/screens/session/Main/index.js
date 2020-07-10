import { connect } from 'react-redux';

import { Creators as applicationActions } from 'Reducers/application';

import Main from './view';

export default connect(() => ({}), {
  logout: applicationActions.logout
})(Main);
