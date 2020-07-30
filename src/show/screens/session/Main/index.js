import { connect } from 'react-redux';

import Main from './view';

export default connect(
  (state) => ({
    availableNavApps: state.device?.availableNavApps,
    coords: state.device?.position?.coords
  }),
  {}
)(Main);
