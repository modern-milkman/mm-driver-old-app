import PropTypes from 'prop-types';
import Config from 'react-native-config';
import React, { useState, useEffect } from 'react';
import { Linking, PixelRatio, Platform, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import I18n from 'Locales/I18n';
import { Fab } from 'Components';
import { deviceFrame } from 'Helpers';
import actionSheet from 'Services/actionSheet';
import { colors, defaults, sizes } from 'Theme';
import { CurrentLocation, MapMarker } from 'Images';

import styles from './style';
import mapStyle from './mapStyle';

import { configuration } from '../../helpers';

const deviceHeight = deviceFrame().height;

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

const changeReturnPosition = (props) => {
  const { returnPosition, updateReturnPosition } = props;
  const actions = {};
  actions[
    `${I18n.t('screens:main.actions.setReturnPosition')}`
  ] = updateReturnPosition.bind(null, false);
  if (returnPosition) {
    actions[
      `${I18n.t('screens:main.actions.clearReturnPosition')}`
    ] = updateReturnPosition.bind(null, true);
  }
  actionSheet(actions, { destructiveButtonIndex: 2 });
};

const fitMapToDirections = (mapRef, directionsPolyline) => {
  if (directionsPolyline && directionsPolyline.length > 0 && mapRef) {
    mapRef.fitToCoordinates(directionsPolyline, {
      edgePadding: {
        top: Platform.OS === 'ios' ? 150 : PixelRatio.get() * 150 - 50,
        right: 50,
        bottom: Platform.OS === 'ios' ? 150 : PixelRatio.get() * 200 - 50,
        left: 50
      },
      animated: true
    });
  }
};

const navigateInSheet = ({ availableNavApps, source, destination }) => {
  const actions = {};
  if (availableNavApps.length === 1) {
    openNavigation({ type: availableNavApps[0], source, destination });
    return;
  }

  for (const type of availableNavApps) {
    actions[
      `${I18n.t('screens:main.actions.openIn', { appName: appName(type) })}`
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
    alert(I18n.t('general:appInstalled', { type })); // eslint-disable-line no-alert
  });
};

const renderMarker = ({
  completed,
  mapMarkerSize,
  sID,
  selectedStopId,
  stop,
  tracksViewChanges,
  updateSelectedStop
}) => {
  return (
    <Marker
      key={sID}
      coordinate={{
        latitude: stop?.latitude,
        longitude: stop?.longitude
      }}
      onPress={updateSelectedStop.bind(null, sID)}
      anchor={{ x: 0, y: 1 }}
      {...(selectedStopId === sID && { zIndex: 1 })}
      tracksViewChanges={tracksViewChanges}>
      <MapMarker
        icon={completed ? 'check' : 'arrow-down'}
        bgColor={
          selectedStopId === sID
            ? colors.secondary
            : completed
            ? colors.input
            : colors.primary
        }
        size={mapMarkerSize}
      />
    </Marker>
  );
};

const Map = (props) => {
  const {
    availableNavApps,
    buttonAccessibility,
    completedStopsIds,
    height,
    coords: { latitude, longitude },
    directionsPolyline,
    mapMarkerSize,
    mapPadding,
    orderedStopsIds,
    selectedStopId,
    stops,
    showDoneDeliveries,
    updateSelectedStop
  } = props;
  const source = { latitude, longitude };
  const destination =
    stops && selectedStopId && stops[selectedStopId]
      ? { ...stops[selectedStopId] }
      : null;

  const [mapRef, setRef] = useState(undefined);
  const [animateCamera, setAnimateCamera] = useState({});
  const [shouldTrackLocation, toggleLocationTracking] = useState({
    gps: false,
    directionsPolyline: true
  });
  const [camera, setCamera] = useState({
    center: {
      latitude,
      longitude
    },
    heading: 0,
    pitch: 0,
    zoom: defaultMapZoom,
    altitude: 1000
  });
  const [tracksViewChanges, setTracksViewChanges] = useState(false);

  useEffect(() => {
    if (shouldTrackLocation.gps) {
      const cameraUpdated = {
        center: {
          latitude,
          longitude
        },
        heading: 0,
        pitch: 0,
        zoom: defaultMapZoom,
        altitude: 1000
      };

      setAnimateCamera(cameraUpdated);

      const animatedCameraCallback = setTimeout(() => {
        setCamera(cameraUpdated);
      }, 500);
      return () => clearTimeout(animatedCameraCallback);
    }
    if (shouldTrackLocation.directionsPolyline) {
      fitMapToDirections(mapRef, directionsPolyline);
    }
  }, [directionsPolyline, latitude, longitude, mapRef, shouldTrackLocation]);

  useEffect(() => {
    toggleLocationTracking({
      gps: false,
      directionsPolyline: true
    });
    setTracksViewChanges(true);
    setTimeout(setTracksViewChanges.bind(null, false), 500);
  }, [selectedStopId]);

  return (
    <View style={[styles.map, { height: deviceHeight }]}>
      <MapView
        key={mapMarkerSize}
        ref={(ref) => setRef(ref)}
        provider={PROVIDER_GOOGLE}
        style={[styles.map, { height }]}
        camera={camera}
        animateCamera={
          shouldTrackLocation.gps && mapRef?.animateCamera(animateCamera)
        }
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={false}
        onPanDrag={toggleLocationTracking.bind(null, {
          gps: false,
          directionsPolyline: false
        })}
        mapPadding={mapPadding}
        customMapStyle={mapStyle}>
        {latitude && longitude && (
          <Marker
            key={'current-location'}
            coordinate={{
              latitude: latitude,
              longitude: longitude
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={true}>
            <CurrentLocation width={25} />
          </Marker>
        )}
        {orderedStopsIds?.map((sID) => {
          const stop = stops[sID];
          return (
            stop &&
            renderMarker({
              sID,
              stop,
              selectedStopId,
              updateSelectedStop,
              tracksViewChanges,
              mapMarkerSize
            })
          );
        })}
        {showDoneDeliveries &&
          completedStopsIds?.map((sID) => {
            const stop = stops[sID];
            return (
              stop &&
              renderMarker({
                sID,
                stop,
                selectedStopId,
                updateSelectedStop,
                tracksViewChanges,
                mapMarkerSize,
                completed: true
              })
            );
          })}
        {!showDoneDeliveries &&
          completedStopsIds.includes(selectedStopId) &&
          stops[selectedStopId] &&
          renderMarker({
            sID: selectedStopId,
            stop: stops[selectedStopId],
            selectedStopId,
            updateSelectedStop,
            tracksViewChanges,
            mapMarkerSize,
            completed: true
          })}
        {directionsPolyline && directionsPolyline.length > 1 && (
          <Polyline
            strokeWidth={3}
            strokeColor={colors.secondary}
            coordinates={directionsPolyline}
            geodesic
          />
        )}
      </MapView>
      <Fab
        type={'material-community'}
        iconName={'crosshairs-gps'}
        size={24}
        containerSize={56}
        color={shouldTrackLocation.gps ? colors.primary : colors.secondary}
        right={10}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
        onPress={toggleLocationTracking.bind(null, {
          gps: !shouldTrackLocation.gps,
          directionsPolyline: shouldTrackLocation.gps
        })}
        onLongPress={changeReturnPosition.bind(null, props)}
      />

      {destination && (
        <Fab
          type="material-community"
          iconName="directions"
          size={24}
          containerSize={56}
          color={colors.primary}
          right={10}
          bottom={
            mapPadding.bottom +
            configuration.foreground.defaultHeight +
            buttonAccessibility +
            defaults.paddingHorizontal * 2 +
            56
          }
          onPress={navigateInSheet.bind(null, {
            availableNavApps,
            source,
            destination
          })}
        />
      )}
    </View>
  );
};

Map.defaultProps = {
  availableNavApps: [],
  height: 0,
  coords: {
    latitude: parseFloat(Config.DEFAULT_LATITUDE),
    longitude: parseFloat(Config.DEFAULT_LONGITUDE)
  },
  directionsPolyline: [],
  mapMarkerSize: sizes.marker.normal,
  mapPadding: { bottom: 0 },
  returnPosition: null,
  showDoneDeliveries: true
};

Map.propTypes = {
  availableNavApps: PropTypes.array,
  buttonAccessibility: PropTypes.number,
  completedStopsIds: PropTypes.array,
  coords: PropTypes.object,
  directionsPolyline: PropTypes.array,
  height: PropTypes.number,
  mapMarkerSize: PropTypes.number,
  mapPadding: PropTypes.object,
  orderedStopsIds: PropTypes.array,
  returnPosition: PropTypes.object,
  selectedStopId: PropTypes.number,
  showDoneDeliveries: PropTypes.bool,
  stops: PropTypes.object,
  updateReturnPosition: PropTypes.func,
  updateSelectedStop: PropTypes.func
};

export default Map;
