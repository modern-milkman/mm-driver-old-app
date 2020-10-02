import Config from 'react-native-config';
import { Vibration as RNVibration } from 'react-native';

import store from 'Redux/store';

const Vibration = {
  ...RNVibration,
  vibrate: (pattern, repeat) => {
    if (store().store.getState().device.vibrate) {
      RNVibration.vibrate(pattern || parseInt(Config.VIBRATION_ERROR), repeat);
    }
  }
};

export default Vibration;
