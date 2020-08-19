import { connect } from 'react-redux';

import Map from './view';

export default connect(
  (state) => ({
    availableNavApps: state.device?.availableNavApps,
    coords: state.device?.position?.coords
  }),
  {}
)(Map);
