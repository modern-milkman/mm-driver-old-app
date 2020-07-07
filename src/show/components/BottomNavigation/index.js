import { connect } from 'react-redux';

import { Creators as applicationActions } from '/process/reducers/application';

import BottomNavigation from './view';

export default connect(null, {
  updateProps: applicationActions.updateProps
})(BottomNavigation);
