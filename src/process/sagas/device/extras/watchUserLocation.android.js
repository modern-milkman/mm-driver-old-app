import Config from 'react-native-config';
import { call } from 'redux-saga/effects';
import { PermissionsAndroid } from 'react-native';
import { getCurrentPosition, watchCurrentPosition } from 'redux-saga-location';

import I18n from 'Locales/I18n';

export function* watchUserLocation() {
  let granted = false;
  const alreadyGranted = yield PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  if (!alreadyGranted) {
    granted = yield PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        message: I18n.t('general:permisions.location.whyLocationUsage')
      }
    );
  }

  if (alreadyGranted || granted === PermissionsAndroid.RESULTS.GRANTED) {
    yield call(getCurrentPosition, {
      enableHighAccuracy: JSON.parse(Config.GEOLOCATION_ENABLE_HIGH_ACCURACY),
      maximumAge: parseFloat(Config.GEOLOCATION_MAXIMUM_AGE)
    });
    yield call(watchCurrentPosition, {
      enableHighAccuracy: JSON.parse(Config.GEOLOCATION_ENABLE_HIGH_ACCURACY),
      maximumAge: parseFloat(Config.GEOLOCATION_MAXIMUM_AGE),
      distanceFilter: parseInt(Config.GOOGLE_MAP_DISTANCE_FILTER)
    });
  }
}
