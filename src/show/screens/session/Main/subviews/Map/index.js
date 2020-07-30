import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Linking } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import I18n from 'Locales/I18n';
import { colors } from 'Theme';
import { Fab } from 'Components';
import actionSheet from 'Services/actionSheet';

import styles from './style';

const defaultMapZoom = 16;

const Map = (props) => {
  const { availableNavApps, height, latitude, longitude, mapPadding } = props;

  const [mapRef, setRef] = useState(undefined);
  const [animateCamera, setAnimateCamera] = useState({});
  const [shouldTrackLocation, toggleLocationTracking] = useState(true);
  const [camera, setCamera] = useState({
    center: {
      latitude,
      longitude
    },
    heading: 0,
    pitch: 0,
    zoom: defaultMapZoom
  });

  useEffect(() => {
    if (shouldTrackLocation) {
      const cameraUpdated = {
        center: {
          latitude,
          longitude
        },
        heading: 0,
        pitch: 0,
        zoom: defaultMapZoom
      };

      setAnimateCamera(cameraUpdated);

      const animatedCameraCallback = setTimeout(() => {
        setCamera(cameraUpdated);
      }, 500);
      return () => clearTimeout(animatedCameraCallback);
    }
  }, [latitude, longitude, shouldTrackLocation]);

  return (
    <View style={{ ...styles.container, height }}>
      <MapView
        ref={(ref) => setRef(ref)}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        camera={camera}
        animateCamera={
          shouldTrackLocation && mapRef?.animateCamera(animateCamera)
        }
        showsUserLocation
        onPanDrag={toggleLocationTracking.bind(null, false)}
        mapPadding={mapPadding}
      />

      <Fab
        type="material-community"
        iconName="crosshairs-gps"
        size={24}
        containerSize={56}
        color={colors.primary}
        right={10}
        bottom={mapPadding.bottom + 10}
        onPress={toggleLocationTracking.bind(null, true)}
      />

      <Fab
        type="material-community"
        iconName="directions"
        size={24}
        containerSize={56}
        color={colors.primary}
        right={10}
        bottom={mapPadding.bottom + 75}
        onPress={navigateInSheet.bind(
          null,
          availableNavApps,
          latitude,
          longitude
        )}
      />
    </View>
  );
};
const openNavigation = (type, latitude, longitude) => {
  let url;

  switch (type) {
    case 'maps': {
      url = `maps:0,0?daddr=${latitude},${longitude}`;
      break;
    }
    case 'comgooglemaps':
    case 'geo': {
      url = `comgooglemaps://?center=${latitude},${longitude}`;
      break;
    }
    case 'waze': {
      url = `waze://ul?ll=${latitude}%2C-${longitude}`;
      break;
    }
  }

  Linking.openURL(url).catch(() => {
    alert(`Please make sure you have ${type} app installed`); // eslint-disable-line no-alert
  });
};

const appName = (type) => {
  switch (type) {
    case 'maps':
      return 'Apple Maps';

    case 'comgooglemaps':
    case 'geo':
      return 'Google Maps';

    case 'waze':
      return 'Waze';
  }
};

const navigateInSheet = (availableNavApps, latitude, longitude) => {
  //TESTING DIRECTIONS, REMOVE THIS LATER!!!!
  latitude = 46.7572506;
  longitude = 23.5238225;

  const actions = {};
  if (availableNavApps.length === 1) {
    openNavigation(availableNavApps[0], latitude, longitude);
    return;
  }

  for (const i of availableNavApps) {
    actions[
      `${I18n.t('screens:main.openIn', { appName: appName(i) })}`
    ] = openNavigation.bind(null, i, latitude, longitude);
  }

  actionSheet(actions);
};

Map.defaultProps = {
  availableNavApps: [],
  height: 0,
  latitude: 0,
  longitude: 0,
  mapPadding: { bottom: 0 }
};

Map.propTypes = {
  availableNavApps: PropTypes.array,
  height: PropTypes.number,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  mapPadding: PropTypes.object
};

export default Map;
