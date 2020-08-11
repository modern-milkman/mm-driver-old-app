import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Linking } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import I18n from 'Locales/I18n';
import { colors } from 'Theme';
import { Fab } from 'Components';
import actionSheet from 'Services/actionSheet';

import styles from './style';

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

const defaultMapZoom = 16;

const navigateInSheet = ({ availableNavApps, source, destination }) => {
  const actions = {};
  if (availableNavApps.length === 1) {
    openNavigation({ type: availableNavApps[0], source, destination });
    return;
  }

  for (const type of availableNavApps) {
    actions[
      `${I18n.t('screens:main.openIn', { appName: appName(type) })}`
    ] = openNavigation.bind(null, {
      type,
      source,
      destination
    });
  }

  actionSheet(actions);
};

const openNavigation = ({
  type,
  source: { latitude: sLatitude, longitude: sLongitude },
  destination: { latitude: dLatitude, longitude: dLongitude }
}) => {
  let url;

  switch (type) {
    case 'maps': {
      url = `maps://${sLatitude},${sLongitude}?daddr=${dLatitude},${dLongitude}&saddr=${sLatitude},${sLongitude}`;
      break;
    }
    case 'comgooglemaps':
    case 'geo': {
      url = `https://www.google.com/maps/dir/?api=1&center=${sLatitude},${sLongitude}&origin=${sLatitude},${sLongitude}&destination=${dLatitude},${dLongitude}&travelmode=driving&dir_action=navigate`;
      break;
    }
    case 'waze': {
      url = `https://waze.com/ul?ll=${dLatitude},${dLongitude}&navigate=yes`;
      break;
    }
  }

  Linking.openURL(url).catch(() => {
    alert(`Please make sure you have ${type} app installed`); // eslint-disable-line no-alert
  });
};

const Map = (props) => {
  const { availableNavApps, height, latitude, longitude, mapPadding } = props;
  const source = { latitude, longitude };
  //TODO REMOVE TESTING DIRECTIONS
  const destination = { latitude: 51.5287718, longitude: -0.2416814 };

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
        onPress={navigateInSheet.bind(null, {
          availableNavApps,
          source,
          destination
        })}
      />
    </View>
  );
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
