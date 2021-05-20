import { connect } from 'react-redux';

import PermissionsMissing from './view';

export default connect(
  (state) => ({
    permisions: state.device.permisions
  }),
  {}
)(PermissionsMissing);
