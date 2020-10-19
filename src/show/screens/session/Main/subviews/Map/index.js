import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';

import Map from './view';

export default connect(
  (state) => {
    return {
      coords: state.device?.position?.coords,
      mapNoTrackingZoom: state.device.mapNoTrackingZoom,
      mapNoTrackingHeading: state.device.mapNoTrackingHeading,
      mapTrackingZoom: state.device.mapTrackingZoom
    };
  },
  {
    updateDeviceProps: deviceActions.updateProps
  }
)(Map);
