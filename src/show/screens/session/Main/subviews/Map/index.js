import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Map from './view';

export default connect(
  state => {
    return {
      centerSelectedStopLocation: state.delivery?.centerSelectedStopLocation,
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
    centerSelectedStop: deliveryActions.centerSelectedStop,
    setMapMode: deviceActions.setMapMode,
    updateDeviceProps: deviceActions.updateProps
  }
)(Map);
