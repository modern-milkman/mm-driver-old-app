import Amplitude from 'amplitude';
import { Platform } from 'react-native';
import Config from 'react-native-config';

import store from 'Redux/store';

import events from './events';

const amplitude = new Amplitude(Config.AMPLITUDE_KEY, {
  options: {
    min_id_length: 1
  }
});
let identifiers = {};

const getIdentifiers = () => {
  const { device, user } = store().store.getState();
  return {
    device_id: device.uniqueID,
    user_id: user.driverId
  };
};

export const EVENTS = events;

export default {
  trackEvent: (eventName, eventData) => {
    if (JSON.parse(Config.TRACK_ANALYTICS_EVENTS)) {
      const { device_id = null, user_id = null } = identifiers;
      if (device_id === null || user_id === null) {
        identifiers = getIdentifiers();
      }

      amplitude.track(
        {
          event_properties: {
            ...eventData
          },

          app_version: `${Config.APP_VERSION_NAME}-${Config.APP_VERSION_CODE}`,
          device_id,
          event_type: `${Config.AMPLITUDE_EVENT_NAME_PREFIX}::${eventName}`,
          os_version: Platform.Version,
          platform: Platform.OS,
          timestamp: new Date(),
          user_id
        },
        { min_id_length: 1 }
      );
    }
  }
};
