import { connect } from 'react-redux';

import { lastRoute } from 'Reducers/application';
import { Creators as deviceActions } from 'Reducers/device';

import Map from './view';

export default connect(
  (state) => {
    return {
      lastRoute: lastRoute(state),
      mapNoTrackingHeading: state.device?.mapNoTrackingHeading,
      mapZoom: state.device?.mapZoom,
      position: state.device?.position,
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
