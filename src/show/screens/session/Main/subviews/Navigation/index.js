import { connect } from 'react-redux';

import { Creators as applicationActions } from 'Reducers/application';

import Navigation from './view';

export default connect(null, {
  updateProps: applicationActions.updateProps
})(Navigation);
