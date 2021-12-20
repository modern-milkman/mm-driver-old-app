import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Markers from './view';

export default connect(
  state => {
    return {
      availableNavApps: state.device?.availableNavApps,
      mapMode: state.device?.mapMode,
      mapNoTrackingHeading: state.device?.mapNoTrackingHeading,
      network: state.device.network,
      position: state.device?.position,
      processing: state.delivery.processing,
      selectedStopId: state.delivery?.selectedStopId,
      shouldPitchMap: state.device?.shouldPitchMap,
      shouldTrackHeading: state.device?.shouldTrackHeading,
      shouldTrackLocation: state.device?.shouldTrackLocation,
      status: state.delivery?.status,
      stops: state.delivery?.stops
    };
  },
  {
    getForDriver: deliveryActions.getForDriver,
    setMapMode: deviceActions.setMapMode,
    updateDeviceProps: deviceActions.updateProps
  }
)(Markers);
