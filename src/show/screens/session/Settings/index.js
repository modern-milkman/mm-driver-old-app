import { connect } from 'react-redux';

import { Creators as deviceActions } from 'Reducers/device';
import { Creators as applicationActions } from 'Reducers/application';
import { Creators as inAppBrowserActions } from 'Reducers/inappbrowser';
import { Creators as deliveryActions, checklist } from 'Reducers/delivery';

import Settings from './view';

export default connect(
  state => ({
    autoOpenStopDetails: state.device.autoOpenStopDetails,
    autoSelectStop: state.device.autoSelectStop,
    biometrics: state.device.biometrics,
    buttonAccessibility: state.device.buttonAccessibility,
    checklist: checklist(state),
    computeDirections: state.device.computeDirections,
    computeShortDirections: state.device.computeShortDirections,
    countDown: state.device.countDown,
    currentLocation: state.device.position,
    darkMode: state.device.darkMode,
    foregroundSize: state.device.foregroundSize,
    isOptimised: state.delivery?.stockWithData?.isOptimised || false,
    language: state.device.language,
    mapMarkerSize: state.device.mapMarkerSize,
    optimisedStopsToShow: state.device.optimisedStopsToShow,
    showDoneDeliveries: state.device.showDoneDeliveries,
    showMapControlsOnMovement: state.device.showMapControlsOnMovement,
    showAllPendingStops: state.device.showAllPendingStops,
    status: state.delivery?.status,
    vibrate: state.device.vibrate
  }),
  {
    biometricDisable: applicationActions.biometricDisable,
    continueDelivering: deliveryActions.continueDelivering,
    updateDeviceProps: deviceActions.updateProps,
    updateInAppBrowserProps: inAppBrowserActions.updateProps,
    setLanguage: deviceActions.setLanguage
  }
)(Settings);
