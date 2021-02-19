import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { Animated, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import MapView, {
  Marker as RNMMarker,
  PROVIDER_GOOGLE
} from 'react-native-maps';

import { sizes } from 'Theme';
import { deviceFrame } from 'Helpers';
import { CurrentLocation } from 'Images';

import styles from './style';
import mapStyle from './mapStyle';
import { DirectionsPolyline, Fabs, Markers } from './subviews';

const deviceHeight = deviceFrame().height;
const cameraAnimationOptions = {
  duration: 500
};

const regionChangeComplete = (
  {
    mapNoTrackingHeading,
    mapRef,
    mapZoom,
    setMapIsInteracting,
    setMapMode,
    shouldTrackHeading,
    shouldTrackLocation,
    showMapControlsOnMovement,
    updateDeviceProps
  },
  region,
  { isGesture }
) => {
  if (mapRef) {
    mapRef.getCamera().then((currentCamera) => {
      updateDeviceProps({
        ...(!shouldTrackHeading && {
          mapNoTrackingHeading: currentCamera.heading
        }),
        mapZoom: currentCamera.zoom
      });
    });
    if (isGesture) {
      setMapIsInteracting(false);
      if (showMapControlsOnMovement) {
        setMapMode('manual');
      }
    }
  }
};

const Map = (props) => {
  const {
    coords: { heading, latitude, longitude },
    fabTop,
    height,
    mapNoTrackingHeading,
    mapPadding,
    mapZoom,
    setMapMode,
    shouldPitchMap,
    shouldTrackHeading,
    shouldTrackLocation,
    showMapControlsOnMovement,
    updateDeviceProps
  } = props;

  const [mapIsInteracting, setMapIsInteracting] = useState(false);
  const [mapRef, setRef] = useState(undefined);

  const initialCamera = {
    altitude: 1000,
    center: {
      latitude,
      longitude
    },
    pitch: shouldPitchMap ? 90 : 0,
    zoom: mapZoom,
    heading: shouldTrackHeading ? heading : mapNoTrackingHeading
  };

  const animateCamera = useCallback(
    (currentCamera, newCameraProps) => {
      mapRef.animateCamera(
        {
          ...currentCamera,
          ...newCameraProps
        },
        cameraAnimationOptions
      );
    },
    [mapRef]
  );

  useEffect(() => {
    if (!mapIsInteracting) {
      mapRef?.getCamera().then((currentCamera) => {
        animateCamera(currentCamera, {
          ...(shouldTrackLocation && {
            center: {
              latitude,
              longitude
            }
          }),
          heading: shouldTrackHeading ? heading : mapNoTrackingHeading,
          pitch: shouldPitchMap ? 90 : 0
        });
      });
    }
  }, [
    animateCamera,
    heading,
    latitude,
    longitude,
    mapIsInteracting,
    mapNoTrackingHeading,
    mapRef,
    shouldPitchMap,
    shouldTrackHeading,
    shouldTrackLocation
  ]);

  return (
    <View style={[styles.map, { height: deviceHeight }]}>
      <MapView
        customMapStyle={mapStyle}
        initialCamera={initialCamera}
        mapPadding={mapPadding}
        onStartShouldSetResponder={setMapIsInteracting.bind(null, true)}
        onRegionChangeComplete={regionChangeComplete.bind(null, {
          mapNoTrackingHeading,
          mapRef,
          mapZoom,
          setMapIsInteracting,
          setMapMode,
          shouldTrackHeading,
          shouldTrackLocation,
          showMapControlsOnMovement,
          updateDeviceProps
        })}
        pitchEnabled={false}
        provider={PROVIDER_GOOGLE}
        ref={(ref) => setRef(ref)}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={false}
        style={[styles.map, { height }]}
        zoomTapEnabled={false}>
        {latitude && longitude && (
          <RNMMarker
            key={'current-location'}
            coordinate={{
              latitude: latitude,
              longitude: longitude
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}>
            <CurrentLocation width={25} />
          </RNMMarker>
        )}

        <Markers />
        <DirectionsPolyline />
      </MapView>
      <Fabs
        fabTop={fabTop}
        mapPadding={mapPadding}
        setMapIsInteracting={setMapIsInteracting}
      />
    </View>
  );
};

Map.defaultProps = {
  coords: {
    heading: 0,
    latitude: parseFloat(Config.DEFAULT_LATITUDE),
    longitude: parseFloat(Config.DEFAULT_LONGITUDE)
  },
  height: 0,
  mapMarkerSize: sizes.marker.normal,
  mapPadding: { bottom: 0 },
  shouldPitchMap: false,
  shouldTrackHeading: false,
  shouldTrackLocation: false,
  showMapControlsOnMovement: true
};

Map.propTypes = {
  coords: PropTypes.object,
  fabTop: PropTypes.instanceOf(Animated.Value),
  height: PropTypes.number,
  mapNoTrackingHeading: PropTypes.number,
  mapPadding: PropTypes.object,
  mapZoom: PropTypes.number,
  setMapMode: PropTypes.func,
  shouldPitchMap: PropTypes.bool,
  shouldTrackHeading: PropTypes.bool,
  shouldTrackLocation: PropTypes.bool,
  showMapControlsOnMovement: PropTypes.bool,
  updateDeviceProps: PropTypes.func
};

export default Map;
