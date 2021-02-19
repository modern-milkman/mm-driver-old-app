import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

import I18n from 'Locales/I18n';
import { Fab } from 'Components';
import { colors, defaults } from 'Theme';
import { deliveryStates as DS } from 'Helpers';
import actionSheet from 'Services/actionSheet';
import { configuration, navigateInSheet } from 'Screens/session/Main/helpers';

const fabContainerSize = 56;
const fabMargin = 10;

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

const toggleProp = (setMapIsInteracting, setMapMode, callback) => {
  setMapMode('manual');
  setMapIsInteracting(true);
  callback();
  setMapIsInteracting(false);
};

const Fabs = (props) => {
  const {
    availableNavApps,
    buttonAccessibility,
    coords,
    fabTop,
    mapMode,
    mapNoTrackingHeading,
    mapPadding,
    processing,
    refreshDriverData,
    selectedStopId,
    setMapIsInteracting,
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

  const source = { latitude: coords?.latitude, longitude: coords?.longitude };

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
      },
      third: {
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
        outputRange: [fabMargin, fabMargin * 4 + fabContainerSize * 3],
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
        type={'material'}
        iconName={shouldTrackLocation ? 'my-location' : 'location-searching'}
        fabTop={fabTop}
        size={24}
        containerSize={fabContainerSize}
        color={shouldTrackLocation ? colors.primary : colors.secondary}
        right={right.interpolate(mapControlInterpolations.position.first)}
        opacity={right.interpolate(mapControlInterpolations.opacity.first)}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
        onPress={toggleProp.bind(
          null,
          setMapIsInteracting,
          setMapMode,
          updateDeviceProps.bind(null, {
            shouldTrackLocation: !shouldTrackLocation
          })
        )}
        onLongPress={changeReturnPosition.bind(null, props)}
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
        right={right.interpolate(mapControlInterpolations.position.second)}
        opacity={right.interpolate(mapControlInterpolations.opacity.second)}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
        onPress={toggleProp.bind(
          null,
          setMapIsInteracting,
          setMapMode,
          updateDeviceProps.bind(null, {
            shouldTrackHeading: !shouldTrackHeading
          })
        )}
      />
      <Fab
        type={'material'}
        iconName={'3d-rotation'}
        fabTop={fabTop}
        size={24}
        containerSize={fabContainerSize}
        color={shouldPitchMap ? colors.primary : colors.secondary}
        right={right.interpolate(mapControlInterpolations.position.third)}
        opacity={right.interpolate(mapControlInterpolations.opacity.third)}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
        onPress={toggleProp.bind(
          null,
          setMapIsInteracting,
          setMapMode,
          updateDeviceProps.bind(null, {
            shouldPitchMap: !shouldPitchMap
          })
        )}
      />
      {destination && (
        <Fab
          type="material-community"
          iconName="directions"
          fabTop={fabTop}
          size={24}
          containerSize={fabContainerSize}
          color={colors.primary}
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
        />
      )}
      {status === DS.DEL && (
        <Fab
          type={'material-community'}
          iconName={'refresh'}
          fabTop={fabTop}
          size={24}
          containerSize={fabContainerSize}
          color={colors.primary}
          left={fabMargin}
          bottom={
            mapPadding.bottom +
            configuration.foreground.defaultHeight +
            buttonAccessibility +
            defaults.paddingHorizontal
          }
          processing={processing}
          onPress={refreshDriverData}
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
  shouldTrackLocation: false,
  returnPosition: null
};

Fabs.propTypes = {
  availableNavApps: PropTypes.array,
  buttonAccessibility: PropTypes.number,
  coords: PropTypes.object,
  fabTop: PropTypes.instanceOf(Animated.Value),
  mapNoTrackingHeading: PropTypes.number,
  mapMode: PropTypes.string,
  mapPadding: PropTypes.object,
  processing: PropTypes.bool,
  refreshDriverData: PropTypes.func,
  returnPosition: PropTypes.object,
  selectedStopId: PropTypes.number,
  setMapIsInteracting: PropTypes.func,
  setMapMode: PropTypes.func,
  shouldPitchMap: PropTypes.bool,
  shouldTrackHeading: PropTypes.bool,
  shouldTrackLocation: PropTypes.bool,
  status: PropTypes.string,
  stops: PropTypes.object,
  updateDeviceProps: PropTypes.func,
  updateReturnPosition: PropTypes.func
};

const areEqual = (prevProps, nextProps) => {
  return !(
    prevProps.processing !== nextProps.processing ||
    prevProps.coords?.latitude !== nextProps.coords?.latitude ||
    prevProps.coords?.longitude !== nextProps.coords?.longitude ||
    prevProps.mapMode !== nextProps.mapMode ||
    prevProps.mapNoTrackingHeading !== nextProps.mapNoTrackingHeading ||
    prevProps.selectedStopId !== nextProps.selectedStopId ||
    prevProps.shouldPitchMap !== nextProps.shouldPitchMap ||
    prevProps.shouldTrackHeading !== nextProps.shouldTrackHeading ||
    prevProps.shouldTrackLocation !== nextProps.shouldTrackLocation ||
    prevProps.returnPosition?.latitude !== nextProps.returnPosition?.latitude ||
    prevProps.returnPosition?.longitude !== nextProps.returnPosition?.longitude
  );
};

export default React.memo(Fabs, areEqual);
