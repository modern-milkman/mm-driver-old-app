import Config from 'react-native-config';
import { createActions, createReducer } from 'reduxsauce';

import { sizes } from 'Theme';
import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    clearFailedRequests: null,
    lowConnectionUpdate: ['lowConnection'],
    pushRequest: ['queue', 'payload'],
    ensureMandatoryPermissions: ['routeName'],
    setLatestApp: ['payload'],
    setLocation: ['position'],
    setLocationHeading: ['heading'],
    setMapMode: ['mode'],
    shareOfflineData: null,
    syncOffline: null,
    updateNetworkProps: ['props'],
    updateProcessor: ['processor', 'value'],
    updateProps: ['props'],
    watchUserLocation: null
  },
  { prefix: 'device/' }
);

const initialState = {
  appcenter: null,
  buttonAccessibility: sizes.button.large,
  computeDirections: false,
  computeShortDirections: false,
  countDown: false,
  foregroundSize: 'large',
  growl: true, // TODO add in Settings screen when growls will also have type info,

  lowConnection: false,
  mapMarkerSize: sizes.marker.normal,
  mapMode: 'auto',
  mapNoTrackingHeading: 0,
  mapZoom: 14,
  network: {
    isConnected: false,
    status: 0 //0-Online * 1-Soft Offline * 2-offline
  },
  permissions: {},
  position: {
    heading: 0,
    latitude: parseFloat(Config.DEFAULT_LATITUDE),
    longitude: parseFloat(Config.DEFAULT_LONGITUDE)
  },
  processors: {
    syncData: false
  },
  requestQueues: {
    offline: [],
    failed: []
  },
  resetHourDay: parseInt(Config.RESET_HOUR_DAY),
  returnPosition: null,
  shouldPitchMap: false,
  shouldTrackHeading: false,
  shouldTrackLocation: false,
  showDoneDeliveries: false,
  showMapControlsOnMovement: true,
  uniqueID: 'uninitialized',
  vibrate: true
};

export const clearFailedRequests = (state) =>
  produce(state, (draft) => {
    draft.requestQueues.failed = [];
  });

export const pushRequest = (state, { queue, payload }) =>
  produce(state, (draft) => {
    draft.requestQueues[queue].push({ datetime: Date.now(), ...payload });
  });

export const setLatestApp = (state, action) =>
  produce(state, (draft) => {
    draft.appcenter = action.payload;
  });

export const setLocation = (state, action) =>
  produce(state, (draft) => {
    const { position } = action;
    if (
      position &&
      !isNaN(parseFloat(position.latitude)) &&
      !isNaN(parseFloat(position.longitude))
    ) {
      draft.position = {
        ...draft.position,
        ...position
      };
    }
  });

export const setLocationHeading = (state, action) =>
  produce(state, (draft) => {
    const { heading } = action;
    if (draft.position) {
      draft.position.heading = heading;
    }
  });

export const updateNetworkProps = (state, { props }) =>
  produce(state, (draft) => {
    let data = { ...props };

    if (props.status) {
      if (!(state.network.status === 2 && props.status === 1)) {
        data.status = props.status;
      } else {
        data.status = state.network.status;
      }
    }

    draft.network = {
      ...state.network,
      ...data
    };
  });

export const updateProcessor = (state, { processor, value }) =>
  produce(state, (draft) => {
    draft.processors[processor] = value;
  });

export const setMapMode = (state, action) =>
  produce(state, (draft) => {
    draft.mapMode = action.mode;
  });

export const syncOffline = (state, { lastRequest, status }) =>
  produce(state, (draft) => {
    if (!lastRequest) {
      draft.requestQueues.syncHasErrors = false;
      draft.requestQueues.toSync = draft.requestQueues.offline.length;
    }
    if (draft.requestQueues.offline.length > 0) {
      draft.processors.syncData = true;
    }
    if (lastRequest === 'synced') {
      draft.requestQueues.offline.splice(0, 1);
    }
    if (lastRequest === 'failure' && status !== 'TIMEOUT') {
      draft.requestQueues.failed.push({
        ...draft.requestQueues.offline.splice(0, 1)[0],
        status
      });
      draft.requestQueues.syncHasErrors = true;
    }
    if (draft.requestQueues.offline.length === 0 || status === 'TIMEOUT') {
      draft.requestQueues.toSync = 0;
    }
  });

export default createReducer(initialState, {
  [Types.CLEAR_FAILED_REQUESTS]: clearFailedRequests,
  [Types.PUSH_REQUEST]: pushRequest,
  [Types.SET_LATEST_APP]: setLatestApp,
  [Types.SET_LOCATION]: setLocation,
  [Types.SET_LOCATION_HEADING]: setLocationHeading,
  [Types.SET_MAP_MODE]: setMapMode,
  [Types.SYNC_OFFLINE]: syncOffline,
  [Types.UPDATE_NETWORK_PROPS]: updateNetworkProps,
  [Types.UPDATE_PROCESSOR]: updateProcessor,
  [Types.UPDATE_PROPS]: updateProps
});

export const device = (state) => state.device;
export const network = (state) => state.device.network;
export const requestQueues = (state) => state.device.requestQueues;
export const processors = (state) => state.device.processors;
