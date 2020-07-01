import Config from 'react-native-config';
import { Vibration as RNVibration } from 'react-native';

const Vibration = {
  ...RNVibration,
  vibrate: (pattern, repeat) => {
    RNVibration.vibrate(pattern || parseInt(Config.VIBRATION_ERROR), repeat);
  }
};

export default Vibration;
