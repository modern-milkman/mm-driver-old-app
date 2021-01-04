import { connect } from 'react-redux';

import UpgradeApp from './view';

export default connect(
  (state) => ({
    appcenter: state.device.appcenter
  }),
  {}
)(UpgradeApp);
