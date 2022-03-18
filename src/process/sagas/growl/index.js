import { select } from 'redux-saga/effects';

import Vibration from 'Services/vibration';
import { device as deviceSelector } from 'Reducers/device';
import { dropdownAlertInstance as dropdownAlertInstanceSelector } from 'Reducers/growl';

// EXPORTED
export const alert = function* ({
  props: { type, title, message, payload, interval }
}) {
  const dropdownAlertWithTypeInstance = yield select(
    dropdownAlertInstanceSelector
  );

  const device = yield select(deviceSelector);
  if (dropdownAlertWithTypeInstance && (device.growl || type === 'error')) {
    dropdownAlertWithTypeInstance(type, title, message, payload, interval);
    if (type === 'error') {
      Vibration.vibrate();
    }
  }
};
