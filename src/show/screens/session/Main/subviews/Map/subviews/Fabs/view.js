import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

import { Fab } from 'Components';
import { colors, defaults } from 'Theme';
import { deliveryStates as DS } from 'Helpers';
import { configuration, navigateInSheet } from 'Screens/session/Main/helpers';

const fabContainerSize = 56;
const fabMargin = 10;

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
    buttonAccessibility,
    fabTop,
    mapIsInteracting,
    mapMode,
    mapNoTrackingHeading,
    mapPadding,
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

  return (
    <>
      <Fab
        type={'material-community'}
        iconName={'plus'}
        fabTop={fabTop}
        size={24}
        containerSize={fabContainerSize}
        color={colors.primary}
        right={fabMargin}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
        rotate={rotate}
        zIndex={2}
        onPress={setMapMode.bind(
          null,
          mapMode === 'manual' ? 'auto' : 'manual'
        )}
      />

      <Fab
        type={'entypo'}
        iconName={'direction'}
        fabTop={fabTop}
        size={24}
        containerSize={fabContainerSize}
        color={shouldTrackHeading ? colors.primary : colors.secondary}
        rotate={
          shouldTrackHeading
            ? new Animated.Value(-50)
            : new Animated.Value(310 - mapNoTrackingHeading)
        }
        right={right.interpolate(mapControlInterpolations.position.first)}
        opacity={right.interpolate(mapControlInterpolations.opacity.first)}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
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
        fabTop={fabTop}
        size={24}
        containerSize={fabContainerSize}
        color={shouldPitchMap ? colors.primary : colors.secondary}
        right={right.interpolate(mapControlInterpolations.position.second)}
        opacity={right.interpolate(mapControlInterpolations.opacity.second)}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
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
        fabTop={fabTop}
        size={24}
        containerSize={fabContainerSize}
        color={shouldTrackLocation ? colors.primary : colors.secondary}
        right={right.interpolate(mapControlInterpolations.position.third)}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
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
          fabTop={fabTop}
          size={24}
          containerSize={fabContainerSize}
          color={network.status === 0 ? colors.primary : colors.inputDark}
          right={fabMargin}
          bottom={
            mapPadding.bottom +
            configuration.foreground.defaultHeight +
            buttonAccessibility +
            defaults.paddingHorizontal * 2 +
            fabContainerSize
          }
          onPress={navigateInSheet.bind(null, {
            availableNavApps,
            source,
            destination
          })}
          disabled={network.status !== 0}
        />
      )}
      {status === DS.DEL && (
        <Fab
          type={'material-community'}
          iconName={'refresh'}
          fabTop={fabTop}
          size={24}
          containerSize={fabContainerSize}
          color={network.status === 0 ? colors.primary : colors.inputDark}
          left={fabMargin}
          bottom={
            mapPadding.bottom +
            configuration.foreground.defaultHeight +
            buttonAccessibility +
            defaults.paddingHorizontal
          }
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
  buttonAccessibility: PropTypes.number,
  fabTop: PropTypes.instanceOf(Animated.Value),
  mapIsInteracting: PropTypes.object,
  mapNoTrackingHeading: PropTypes.number,
  mapMode: PropTypes.string,
  mapPadding: PropTypes.object,
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
