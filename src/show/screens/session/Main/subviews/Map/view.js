import PropTypes from 'prop-types';
import { View } from 'react-native';
import Config from 'react-native-config';
import React, { useEffect, useState } from 'react';
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

const regionChangeComplete = (
  {
    mapNoTrackingHeading,
    mapNoTrackingZoom,
    mapRef,
    mapTrackingZoom,
    setUserIsInteracting,
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
      setUserIsInteracting(false);
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

  const [animateCamera, setAnimateCamera] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapRef, setRef] = useState(undefined);
  const [shouldTrackLocation, toggleLocationTracking] = useState(false);
  const [userIsInteracting, setUserIsInteracting] = useState(false);

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

  useEffect(() => {
    // lat long changed should only affect if location is tracked
    mapRef?.getCamera().then((currentCamera) => {
      if (shouldTrackLocation) {
        setAnimateCamera({
          ...currentCamera,
          center: {
            latitude,
            longitude
          },
          heading,
          pitch: 90,
          zoom: mapTrackingZoom
        });
      } else {
        setAnimateCamera({
          ...currentCamera,
          heading: mapNoTrackingHeading,
          pitch: 0,
          zoom: mapNoTrackingZoom
        });
        setTimeout(() => {
          setAnimateCamera(null);
        }, 500);
      }
    });
  }, [
    heading,
    latitude,
    longitude,
    mapNoTrackingHeading,
    mapNoTrackingZoom,
    mapRef,
    mapTrackingZoom,
    shouldTrackLocation,
    userIsInteracting
  ]);

  return (
    <View style={[styles.map, { height: deviceHeight }]}>
      <MapView
        {...(mapReady &&
          mapRef &&
          animateCamera &&
          !userIsInteracting && {
            animateCamera: mapRef.animateCamera(animateCamera)
          })}
        customMapStyle={mapStyle}
        initialCamera={initialCamera}
        mapPadding={mapPadding}
        onMapReady={setMapReady.bind(null, true)}
        onStartShouldSetResponder={setUserIsInteracting.bind(null, true)}
        onRegionChangeComplete={regionChangeComplete.bind(null, {
          mapNoTrackingHeading,
          mapNoTrackingZoom,
          mapRef,
          mapTrackingZoom,
          setUserIsInteracting,
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
