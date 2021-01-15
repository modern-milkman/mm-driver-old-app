import { connect } from 'react-redux';

import { Creators as growlActions } from 'Reducers/growl';

import Growl from './view';

export default connect(
  (state) => ({
    growl: state.growl
  }),
  {
    updateProps: growlActions.updateProps
  }
)(Growl);
