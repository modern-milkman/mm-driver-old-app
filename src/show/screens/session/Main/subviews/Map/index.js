import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';

import Map from './view';

export default connect(
  (state) => {
    return {
      coords: state.device?.position?.coords,
      mapNoTrackingHeading: state.device?.mapNoTrackingHeading,
      mapZoom: state.device?.mapZoom,
      shouldPitchMap: state.device?.shouldPitchMap,
      shouldTrackHeading: state.device?.shouldTrackHeading,
      shouldTrackLocation: state.device?.shouldTrackLocation,
      showMapControlsOnMovement: state.device?.showMapControlsOnMovement
    };
  },
  {
    setMapMode: deviceActions.setMapMode,
    updateDeviceProps: deviceActions.updateProps
  }
)(Map);
