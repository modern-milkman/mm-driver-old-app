import PropTypes from 'prop-types';
import { View } from 'react-native';
import Config from 'react-native-config';
import React, { useCallback, useEffect, useState } from 'react';
import MapView, {
  Marker as RNMMarker,
  PROVIDER_GOOGLE
} from 'react-native-maps';

import { sizes } from 'Theme';
import { CurrentLocation } from 'Images';
import { deviceFrame, usePrevious } from 'Helpers';
import Analytics, { EVENTS } from 'Services/analytics';

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
    mapNoTrackingZoom,
    mapRef,
    mapTrackingZoom,
    setMapIsInteracting,
    shouldTrackLocation,
    updateDeviceProps
  },
  region,
  { isGesture }
) => {
  if (mapRef) {
    mapRef.getCamera().then((currentCamera) => {
      updateDeviceProps({
        ...(shouldTrackLocation && {
          mapTrackingZoom: currentCamera.zoom
        }),
        ...(!shouldTrackLocation && {
          mapNoTrackingHeading: currentCamera.heading,
          mapNoTrackingZoom: currentCamera.zoom
        })
      });
    });
    if (isGesture) {
      setMapIsInteracting(false);
    }
  }
};

const Map = (props) => {
  const {
    height,
    coords: { heading, latitude, longitude },
    mapNoTrackingHeading,
    mapNoTrackingZoom,
    mapPadding,
    mapTrackingZoom,
    updateDeviceProps
  } = props;

  const [mapIsInteracting, setMapIsInteracting] = useState(false);
  const [mapRef, setRef] = useState(undefined);
  const [shouldTrackLocation, toggleLocationTracking] = useState(false);

  const previousShouldTrackLocation = usePrevious(shouldTrackLocation);
  const previousHeading = usePrevious(heading);
  const previousLatitude = usePrevious(latitude);
  const previousLongitude = usePrevious(longitude);

  const initialCamera = {
    altitude: 1000,
    center: {
      latitude,
      longitude
    },
    ...(shouldTrackLocation
      ? {
          pitch: 90,
          zoom: mapTrackingZoom
        }
      : {
          heading: mapNoTrackingHeading,
          pitch: 0,
          zoom: mapNoTrackingZoom
        })
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
    if (previousShouldTrackLocation !== shouldTrackLocation) {
      setMapIsInteracting(true);
      mapRef?.getCamera().then((currentCamera) => {
        animateCamera(currentCamera, {
          pitch: shouldTrackLocation ? 90 : 0
        });
      });
      setTimeout(
        setMapIsInteracting.bind(null, false),
        cameraAnimationOptions.duration
      );
      Analytics.trackEvent(EVENTS.MAP_MODE, {
        mode: shouldTrackLocation ? 'track' : 'birds-eye'
      });
    }
    if (
      !mapIsInteracting &&
      shouldTrackLocation &&
      (previousLatitude !== latitude ||
        previousLongitude !== longitude ||
        previousHeading !== heading)
    ) {
      mapRef?.getCamera().then((currentCamera) => {
        animateCamera(currentCamera, {
          center: {
            latitude,
            longitude
          },
          heading
        });
      });
    }
  }, [
    animateCamera,
    heading,
    latitude,
    longitude,
    mapIsInteracting,
    mapRef,
    previousHeading,
    previousLatitude,
    previousLongitude,
    previousShouldTrackLocation,
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
          mapNoTrackingZoom,
          mapRef,
          mapTrackingZoom,
          setMapIsInteracting,
          shouldTrackLocation,
          updateDeviceProps
        })}
        pitchEnabled={false}
        provider={PROVIDER_GOOGLE}
        ref={(ref) => setRef(ref)}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={false}
        style={[styles.map, { height }]}>
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
        mapPadding={mapPadding}
        shouldTrackLocation={shouldTrackLocation}
        toggleLocationTracking={toggleLocationTracking}
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
  mapPadding: { bottom: 0 }
};

Map.propTypes = {
  coords: PropTypes.object,
  height: PropTypes.number,
  mapNoTrackingZoom: PropTypes.number,
  mapNoTrackingHeading: PropTypes.number,
  mapPadding: PropTypes.object,
  mapTrackingZoom: PropTypes.number,
  updateDeviceProps: PropTypes.func
};

export default Map;
