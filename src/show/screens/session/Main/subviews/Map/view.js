import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { View, Platform } from 'react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import MapView, {
  Marker as RNMMarker,
  PROVIDER_GOOGLE
} from 'react-native-maps';

import { sizes } from 'Theme';
import { useTheme } from 'Containers';
import { CurrentLocation } from 'Images';

import styles from './style';
import mapStyle from './mapStyle';
import { DirectionsPolyline, Fabs, Markers } from './subviews';

const cameraAnimationOptions = {
  duration: 325
};

const regionChangeComplete = (
  {
    heading,
    initialCamera,
    mapIsInteracting,
    mapNoTrackingHeading,
    mapRef,
    mapZoom,
    setMapMode,
    shouldTrackHeading,
    shouldTrackLocation,
    showMapControlsOnMovement,
    updateDeviceProps
  },
  region,
  { isGesture }
) => {
  if (mapRef.current) {
    mapRef.current.getCamera().then(currentCamera => {
      initialCamera.current = currentCamera;
      updateDeviceProps({
        ...(!shouldTrackHeading && {
          mapNoTrackingHeading: currentCamera.heading
        }),
        ...(Platform.OS === 'android' && { mapZoom: currentCamera.zoom }),
        ...(Platform.OS === 'ios' && { mapZoom: currentCamera.altitude })
      });
    });
    if (isGesture) {
      if (shouldTrackHeading) {
        mapRef.current.getCamera().then(currentCamera => {
          if (
            Math.abs(Math.abs(currentCamera.heading) - Math.abs(heading)) > 10
          ) {
            updateDeviceProps({ shouldTrackHeading: false });
          }
        });
      }
      mapIsInteracting.current = false;
      if (showMapControlsOnMovement) {
        setMapMode('manual');
      }
    }
  }
};

const setMapRef = (mapRef, ref) => {
  mapRef.current = ref;
};

const triggerManualMove = ({
  mapIsInteracting,
  shouldTrackLocation,
  updateDeviceProps
}) => {
  mapIsInteracting.current = true;
  if (shouldTrackLocation) {
    updateDeviceProps({ shouldTrackLocation: false });
  }
};

const Map = props => {
  const { theme } = useTheme();
  const {
    darkMode,
    centerMapLocation,
    clearCenterMapLocation,
    mapNoTrackingHeading,
    mapZoom,
    position: { heading, latitude, longitude },
    setMapMode,
    shouldPitchMap,
    shouldTrackHeading,
    shouldTrackLocation,
    showMapControlsOnMovement,
    updateDeviceProps
  } = props;

  let mapIsInteracting = useRef(false);
  let mapRef = useRef(undefined);
  let mapIsAnimating = useRef(false);

  let initialCamera = useRef({
    center: {
      latitude,
      longitude
    },
    pitch: shouldPitchMap ? 90 : 0,
    ...Platform.select({
      android: { zoom: mapZoom },
      ios: { altitude: mapZoom }
    }),
    heading: shouldTrackHeading ? heading || 0 : mapNoTrackingHeading
  });

  const animateCamera = useCallback(
    (currentCamera, newCameraProps) => {
      if (!mapIsAnimating.current) {
        mapIsAnimating.current = true;
        mapRef.current.animateCamera(
          {
            ...currentCamera,
            ...newCameraProps
          },
          cameraAnimationOptions
        );
        setTimeout(() => {
          mapIsAnimating.current = false;
        }, cameraAnimationOptions.duration);
      }
    },
    [mapRef]
  );

  useEffect(() => {
    if (!mapIsInteracting.current || centerMapLocation) {
      mapRef.current?.getCamera().then(currentCamera => {
        //Reposition map if on the middle of nowhere
        if (
          currentCamera.center.longitude === 0 &&
          currentCamera.center.latitude === 0
        ) {
          animateCamera(currentCamera, {
            center: {
              latitude,
              longitude
            },
            ...Platform.select({
              android: { zoom: mapZoom },
              ios: { altitude: mapZoom }
            })
          });
        }

        animateCamera(currentCamera, {
          ...(shouldTrackLocation && {
            center: {
              latitude,
              longitude
            }
          }),
          ...(centerMapLocation && {
            center: {
              ...centerMapLocation
            }
          }),
          heading: shouldTrackHeading ? heading || 0 : mapNoTrackingHeading,
          pitch: shouldPitchMap ? (Platform.OS === 'android' ? 90 : 45) : 0,
          ...Platform.select({
            android: { zoom: mapZoom },
            ios: { altitude: mapZoom }
          })
        });
      });
    }
    if (centerMapLocation) {
      clearCenterMapLocation();
    }
  }, [
    animateCamera,
    centerMapLocation,
    clearCenterMapLocation,
    heading,
    latitude,
    longitude,
    mapIsInteracting,
    mapNoTrackingHeading,
    mapRef,
    mapZoom,
    shouldPitchMap,
    shouldTrackHeading,
    shouldTrackLocation
  ]);

  return (
    <View style={styles.map}>
      <MapView
        customMapStyle={mapStyle[theme]}
        initialCamera={initialCamera.current}
        minZoomLevel={parseInt(
          Platform.OS === 'android'
            ? Config.ANDROID_MIN_MAP_ZOOM_LEVEL
            : Config.IOS_MIN_MAP_ZOOM_LEVEL
        )}
        moveOnMarkerPress={false}
        onStartShouldSetResponder={triggerManualMove.bind(null, {
          mapIsInteracting,
          shouldTrackLocation,
          updateDeviceProps
        })}
        onRegionChangeComplete={regionChangeComplete.bind(null, {
          heading,
          initialCamera,
          mapIsInteracting,
          mapNoTrackingHeading,
          mapRef,
          mapZoom,
          setMapMode,
          shouldTrackHeading,
          shouldTrackLocation,
          showMapControlsOnMovement,
          updateDeviceProps
        })}
        pitchEnabled={false}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        ref={setMapRef.bind(null, mapRef)}
        showsCompass={false}
        showsIndoors={false}
        userInterfaceStyle={darkMode ? 'dark' : 'light'}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsTraffic={false}
        showsUserLocation={false}
        style={[styles.map]}>
        {latitude && longitude && (
          <RNMMarker
            key={'current-location'}
            coordinate={{
              latitude: latitude,
              longitude: longitude
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={true}>
            <CurrentLocation width={25} />
          </RNMMarker>
        )}

        <Markers />
        <DirectionsPolyline />
      </MapView>
      <Fabs mapIsInteracting={mapIsInteracting} />
    </View>
  );
};

Map.defaultProps = {
  darkMode: 'true',
  mapMarkerSize: sizes.marker.normal,
  position: {
    heading: 0,
    latitude: parseFloat(Config.DEFAULT_LATITUDE),
    longitude: parseFloat(Config.DEFAULT_LONGITUDE)
  },
  shouldPitchMap: false,
  shouldTrackHeading: false,
  shouldTrackLocation: false,
  showMapControlsOnMovement: true
};

Map.propTypes = {
  centerMapLocation: PropTypes.object,
  clearCenterMapLocation: PropTypes.func,
  darkMode: PropTypes.bool,
  height: PropTypes.number,
  mapNoTrackingHeading: PropTypes.number,
  mapZoom: PropTypes.number,
  position: PropTypes.object,
  setMapMode: PropTypes.func,
  shouldPitchMap: PropTypes.bool,
  shouldTrackHeading: PropTypes.bool,
  shouldTrackLocation: PropTypes.bool,
  showMapControlsOnMovement: PropTypes.bool,
  updateDeviceProps: PropTypes.func
};

export default Map;
