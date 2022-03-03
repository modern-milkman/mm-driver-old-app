import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import Config from 'react-native-config';
import React, { useEffect, useRef } from 'react';

import { Fab } from 'Components';
import { colors, defaults, sizes } from 'Theme';

import { deliveryStates as DS } from 'Helpers';
import { navigateInSheet } from 'Screens/session/Main/helpers';

const fabContainerSize = sizes.fab.container;
const fabMargin = defaults.marginHorizontal / 2;

const toggleProp = ({ callback, mapIsInteracting, setMapMode }) => {
  if (setMapMode) {
    setMapMode('manual');
  }
  mapIsInteracting.current = true;
  callback();
  mapIsInteracting.current = false;
};

const Fabs = props => {
  const {
    availableNavApps,
    mapIsInteracting,
    mapMode,
    mapNoTrackingHeading,
    network,
    position,
    processing,
    getForDriver,
    selectedStopId,
    setMapMode,
    shouldPitchMap,
    shouldTrackHeading,
    shouldTrackLocation,
    status,
    stops,
    updateDeviceProps
  } = props;

  const rotate = useRef(new Animated.Value(0)).current;
  const right = useRef(new Animated.Value(0)).current;

  const source = {
    latitude: position?.latitude,
    longitude: position?.longitude
  };

  const destination =
    stops && selectedStopId && stops[selectedStopId]
      ? { ...stops[selectedStopId] }
      : null;

  const mapControlInterpolations = {
    opacity: {
      first: {
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
      },
      second: {
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
      }
    },
    position: {
      first: {
        inputRange: [0, 100],
        outputRange: [fabMargin, fabMargin * 2 + fabContainerSize],
        extrapolate: 'clamp'
      },
      second: {
        inputRange: [0, 100],
        outputRange: [fabMargin, fabMargin * 3 + fabContainerSize * 2],
        extrapolate: 'clamp'
      },
      third: {
        inputRange: [0, 100],
        outputRange: [
          fabMargin * 2 + fabContainerSize,
          fabMargin * 4 + fabContainerSize * 3
        ],
        extrapolate: 'clamp'
      }
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotate, {
        toValue: mapMode === 'manual' ? 225 : 0,
        duration: 500
      }),
      Animated.timing(right, {
        toValue: mapMode === 'manual' ? 100 : 0,
        duration: 500
      })
    ]).start();
  }, [mapMode, right, rotate]);

  return (
    <>
      <Fab
        type={'material-community'}
        iconName={'plus'}
        containerSize={fabContainerSize}
        color={colors.primary}
        right={fabMargin}
        bottom={defaults.paddingHorizontal / 2}
        rotate={rotate}
        onPress={setMapMode.bind(
          null,
          mapMode === 'manual' ? 'auto' : 'manual'
        )}
        zIndex={2}
      />

      <Fab
        type={'entypo'}
        iconName={'direction'}
        containerSize={fabContainerSize}
        color={shouldTrackHeading ? colors.primary : colors.secondary}
        rotate={
          shouldTrackHeading
            ? new Animated.Value(-50)
            : new Animated.Value(310 - mapNoTrackingHeading)
        }
        right={right.interpolate(mapControlInterpolations.position.first)}
        opacity={right.interpolate(mapControlInterpolations.opacity.first)}
        bottom={defaults.paddingHorizontal / 2}
        onPress={toggleProp.bind(null, {
          callback: updateDeviceProps.bind(null, {
            shouldTrackHeading: !shouldTrackHeading
          }),
          mapIsInteracting,
          setMapMode
        })}
      />
      <Fab
        type={'material'}
        iconName={'3d-rotation'}
        containerSize={fabContainerSize}
        color={shouldPitchMap ? colors.primary : colors.secondary}
        right={right.interpolate(mapControlInterpolations.position.second)}
        opacity={right.interpolate(mapControlInterpolations.opacity.second)}
        bottom={defaults.paddingHorizontal / 2}
        onPress={toggleProp.bind(null, {
          callback: updateDeviceProps.bind(null, {
            shouldPitchMap: !shouldPitchMap
          }),
          mapIsInteracting,
          setMapMode
        })}
      />
      <Fab
        type={'material'}
        iconName={shouldTrackLocation ? 'my-location' : 'location-searching'}
        containerSize={fabContainerSize}
        color={shouldTrackLocation ? colors.primary : colors.secondary}
        right={right.interpolate(mapControlInterpolations.position.third)}
        bottom={defaults.paddingHorizontal / 2}
        onPress={toggleProp.bind(null, {
          callback: updateDeviceProps.bind(null, {
            shouldTrackLocation: !shouldTrackLocation
          }),
          mapIsInteracting
        })}
      />
      {destination && (
        <Fab
          type="material-community"
          iconName="directions"
          containerSize={fabContainerSize}
          color={network.status === 0 ? colors.primary : colors.inputDark}
          right={fabMargin}
          bottom={fabContainerSize + defaults.marginVertical}
          onPress={navigateInSheet.bind(null, {
            availableNavApps,
            source,
            destination
          })}
          disabled={network.status !== 0}
        />
      )}
      {(status === DS.DEL || Config.ENVIRONMENT !== 'production') && (
        <Fab
          type={'material-community'}
          iconName={'refresh'}
          containerSize={fabContainerSize}
          color={network.status === 0 ? colors.primary : colors.inputDark}
          left={fabMargin}
          bottom={defaults.paddingHorizontal / 2}
          processing={processing}
          onPress={getForDriver}
          disabled={network.status !== 0}
        />
      )}
    </>
  );
};

Fabs.defaultProps = {
  availableNavApps: [],
  mapNoTrackingHeading: 0,
  mapMode: 'auto',
  shouldPitchMap: false,
  shouldTrackHeading: false,
  shouldTrackLocation: false
};

Fabs.propTypes = {
  availableNavApps: PropTypes.array,
  mapIsInteracting: PropTypes.object,
  mapNoTrackingHeading: PropTypes.number,
  mapMode: PropTypes.string,
  network: PropTypes.object,
  position: PropTypes.object,
  processing: PropTypes.bool,
  getForDriver: PropTypes.func,
  selectedStopId: PropTypes.number,
  setMapMode: PropTypes.func,
  shouldPitchMap: PropTypes.bool,
  shouldTrackHeading: PropTypes.bool,
  shouldTrackLocation: PropTypes.bool,
  status: PropTypes.string,
  stops: PropTypes.object,
  updateDeviceProps: PropTypes.func
};

const areEqual = (prevProps, nextProps) => {
  return !(
    prevProps.processing !== nextProps.processing ||
    prevProps.position?.latitude !== nextProps.position?.latitude ||
    prevProps.position?.longitude !== nextProps.position?.longitude ||
    prevProps.mapMode !== nextProps.mapMode ||
    prevProps.mapNoTrackingHeading !== nextProps.mapNoTrackingHeading ||
    prevProps.network.status !== nextProps.network.status ||
    prevProps.selectedStopId !== nextProps.selectedStopId ||
    prevProps.shouldPitchMap !== nextProps.shouldPitchMap ||
    prevProps.shouldTrackHeading !== nextProps.shouldTrackHeading ||
    prevProps.shouldTrackLocation !== nextProps.shouldTrackLocation
  );
};

export default React.memo(Fabs, areEqual);
