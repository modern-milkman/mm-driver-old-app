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
    heading,
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
      mapRef.getCamera().then((currentCamera) => {
        if (
          Math.abs(Math.abs(currentCamera.heading) - Math.abs(heading)) > 10
        ) {
          updateDeviceProps({ shouldTrackHeading: false });
        }
      });
      setMapIsInteracting(false);
      if (showMapControlsOnMovement) {
        setMapMode('manual');
      }
    }
  }
};

const triggerManualMove = ({ setMapIsInteracting, updateDeviceProps }) => {
  setMapIsInteracting(true);
  updateDeviceProps({ shouldTrackLocation: false });
};

const Map = (props) => {
  const {
    fabTop,
    height,
    mapNoTrackingHeading,
    mapPadding,
    mapZoom,
    position: { heading, latitude, longitude },
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
    heading: shouldTrackHeading ? heading || 0 : mapNoTrackingHeading
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
          heading: shouldTrackHeading ? heading || 0 : mapNoTrackingHeading,
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
        onStartShouldSetResponder={triggerManualMove.bind(null, {
          setMapIsInteracting,
          updateDeviceProps
        })}
        onRegionChangeComplete={regionChangeComplete.bind(null, {
          heading,
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
  height: 0,
  mapMarkerSize: sizes.marker.normal,
  mapPadding: { bottom: 0 },
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
  fabTop: PropTypes.instanceOf(Animated.Value),
  height: PropTypes.number,
  mapNoTrackingHeading: PropTypes.number,
  mapPadding: PropTypes.object,
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
