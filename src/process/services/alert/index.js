// SEE https://facebook.github.io/react-native/docs/alert
// usage after import from Services/alert:
// Alert({title: 'test', message: 'message', buttons: [{},{},{},{}]});

import { Alert, Platform } from 'react-native';

export default ({
  title = '',
  message = '',
  buttons = [],
  options = null,
  type = null
}) => {
  if (
    (Platform.OS === 'ios' && buttons && buttons.length > 2) ||
    (Platform.OS === 'android' && buttons && buttons.length > 3)
  ) {
    throw new Error(
      'Alerts can have at most 2 buttons on iOS and 3 buttons on Android'
    );
  }
  Alert.alert(title, message, buttons, options, type);
};
