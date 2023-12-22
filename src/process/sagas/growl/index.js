import Config from 'react-native-config';
import { select } from 'redux-saga/effects';

import Vibration from 'Services/vibration';
import { device as deviceSelector } from 'Reducers/device';
import { dropdownAlertInstance as dropdownAlertInstanceSelector } from 'Reducers/growl';

// EXPORTED
export const alert = function* ({
  props: {
    interval = parseInt(Config.GROWL_AUTOHIDE),
    message,
    payload,
    title,
    type
  }
}) {
  const dropdownAlertWithTypeInstance = yield select(
    dropdownAlertInstanceSelector
  );
  const device = yield select(deviceSelector);
  if (dropdownAlertWithTypeInstance && (device.growl || type === 'error')) {
    dropdownAlertWithTypeInstance({ interval, message, payload, title, type });
    if (type === 'error') {
      Vibration.vibrate();
    }
  }
};
