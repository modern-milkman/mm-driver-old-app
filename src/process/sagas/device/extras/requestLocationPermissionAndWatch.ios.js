import Config from 'react-native-config';
import { call } from 'redux-saga/effects';
import { getCurrentPosition, watchCurrentPosition } from 'redux-saga-location';

export function* requestLocationPermissionAndWatch() {
  yield call(getCurrentPosition, {
    enableHighAccuracy: JSON.parse(Config.GEOLOCATION_ENABLE_HIGH_ACCURACY),
    maximumAge: parseFloat(Config.GEOLOCATION_MAXIMUM_AGE)
  });
  yield call(watchCurrentPosition, {
    enableHighAccuracy: JSON.parse(Config.GEOLOCATION_ENABLE_HIGH_ACCURACY),
    maximumAge: parseFloat(Config.GEOLOCATION_MAXIMUM_AGE)
  });
}
