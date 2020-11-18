import Amplitude from 'amplitude';
import { Platform } from 'react-native';
import Config from 'react-native-config';

import store from 'Redux/store';

import events from './events';

const amplitude = new Amplitude(Config.AMPLITUDE_KEY);
let identifiers = {};

const getIdentifiers = () => {
  const { device } = store().store.getState();
  return {
    device_id: device.uniqueID
  };
};

export const EVENTS = events;

export default {
  trackEvent: (eventName, eventData) => {
    if (JSON.parse(Config.TRACK_ANALYTICS_EVENTS)) {
      const { device_id = null } = identifiers;
      if (device_id === null) {
        identifiers = getIdentifiers();
      }

      amplitude.track({
        event_properties: {
          ...eventData
        },

        app_version: `${Config.APP_VERSION_NAME}-${Config.APP_VERSION_CODE}`,
        device_id,
        event_type: `${Config.AMPLITUDE_EVENT_NAME_PREFIX}::${eventName}`,
        os_version: Platform.Version,
        platform: Platform.OS,
        timestamp: new Date()
      });
    }
  }
};
