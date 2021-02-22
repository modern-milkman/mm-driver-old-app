import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as deliveryActions } from 'Reducers/delivery';

import Markers from './view';

export default connect(
  (state) => {
    return {
      availableNavApps: state.device?.availableNavApps,
      buttonAccessibility: state.device.buttonAccessibility,
      mapMode: state.device?.mapMode,
      mapNoTrackingHeading: state.device?.mapNoTrackingHeading,
      position: state.device?.position,
      processing: state.delivery.processing,
      returnPosition: state.device?.returnPosition,
      selectedStopId: state.delivery?.selectedStopId,
      shouldPitchMap: state.device?.shouldPitchMap,
      shouldTrackHeading: state.device?.shouldTrackHeading,
      shouldTrackLocation: state.device?.shouldTrackLocation,
      status: state.delivery?.status,
      stops: state.delivery?.stops
    };
  },
  {
    refreshDriverData: deliveryActions.refreshDriverData,
    setMapMode: deviceActions.setMapMode,
    updateDeviceProps: deviceActions.updateProps,
    updateReturnPosition: deliveryActions.updateReturnPosition
  }
)(Markers);
