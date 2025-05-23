import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Map from './view';

export default connect(
  state => {
    return {
      centerMapLocation: state.delivery?.centerMapLocation,
      mapNoTrackingHeading: state.device?.mapNoTrackingHeading,
      darkMode: state.device?.darkMode,
      mapZoom: state.device?.mapZoom,
      position: state.device?.position,
      shouldPitchMap: state.device?.shouldPitchMap,
      shouldTrackHeading: state.device?.shouldTrackHeading,
      shouldTrackLocation: state.device?.shouldTrackLocation,
      showMapControlsOnMovement: state.device?.showMapControlsOnMovement
    };
  },
  {
    clearCenterMapLocation: deliveryActions.clearCenterMapLocation,
    setMapMode: deviceActions.setMapMode,
    updateDeviceProps: deviceActions.updateProps
  }
)(Map);
