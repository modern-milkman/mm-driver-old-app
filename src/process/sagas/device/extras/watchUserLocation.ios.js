import Config from 'react-native-config';
import { call } from 'redux-saga/effects';
import {
  getCurrentPosition,
  watchCurrentPosition,
  stopObserving
} from 'redux-saga-location';

export function* watchUserLocation() {
  yield call(stopObserving);
  yield call(getCurrentPosition, {
    enableHighAccuracy: JSON.parse(Config.GEOLOCATION_ENABLE_HIGH_ACCURACY),
    maximumAge: parseFloat(Config.GEOLOCATION_MAXIMUM_AGE),
    timeout: parseFloat(Config.GEOLOCATION_TIMEOUT)
  });
  yield call(watchCurrentPosition, {
    distanceFilter: parseInt(Config.GOOGLE_MAP_DISTANCE_FILTER),
    enableHighAccuracy: JSON.parse(Config.GEOLOCATION_ENABLE_HIGH_ACCURACY),
    maximumAge: parseFloat(Config.GEOLOCATION_MAXIMUM_AGE),
    timeout: parseFloat(Config.GEOLOCATION_TIMEOUT)
  });
}
