import Config from 'react-native-config';
import { createActions, createReducer } from 'reduxsauce';

import { sizes } from 'Theme';
import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    requestUserLocationPermisions: null,
    setLatestApp: ['payload'],
    setLocation: ['position'],
    updateProps: ['props']
  },
  { prefix: 'device/' }
);

const initialState = {
  appcenter: null,
  buttonAccessibility: sizes.button.large,
  foregroundSize: 'large',
  growl: true, // TODO add in Settings screen when growls will also have type info
  mapNoTrackingZoom: 12,
  mapNoTrackingHeading: 0,
  mapMarkerSize: sizes.marker.normal,
  mapTrackingZoom: 19,
  position: null,
  resetHourDay: parseInt(Config.RESET_HOUR_DAY),
  returnPosition: null,
  showDoneDeliveries: false,
  uniqueID: 'uninitialized',
  vibrate: true
};

export const setLatestApp = (state, action) =>
  produce(state, (draft) => {
    draft.appcenter = action.payload;
  });

export const setLocation = (state, action) =>
  produce(state, (draft) => {
    const { position } = action;
    if (
      position &&
      !isNaN(parseFloat(position.coords.latitude)) &&
      !isNaN(parseFloat(position.coords.longitude))
    ) {
      draft.position = position;
    }
  });

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps,
  [Types.SET_LATEST_APP]: setLatestApp,
  [Types.SET_LOCATION]: setLocation
});

export const device = (state) => state.device;
