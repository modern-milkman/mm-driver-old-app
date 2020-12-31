import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

import I18n from 'Locales/I18n';
import { Fab } from 'Components';
import { colors, defaults } from 'Theme';
import actionSheet from 'Services/actionSheet';
import { configuration, navigateInSheet } from 'Screens/session/Main/helpers';

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

const Fabs = (props) => {
  const {
    availableNavApps,
    buttonAccessibility,
    coords,
    deliveryStatus,
    fabTop,
    mapPadding,
    processing,
    refreshDriverData,
    selectedStopId,
    shouldTrackLocation,
    stops,
    toggleLocationTracking
  } = props;

  const source = { latitude: coords?.latitude, longitude: coords?.longitude };

  const destination =
    stops && selectedStopId && stops[selectedStopId]
      ? { ...stops[selectedStopId] }
      : null;

  return (
    <>
      <Fab
        type={'material-community'}
        iconName={'crosshairs-gps'}
        fabTop={fabTop}
        size={24}
        containerSize={56}
        color={shouldTrackLocation ? colors.primary : colors.secondary}
        right={10}
        bottom={
          mapPadding.bottom +
          configuration.foreground.defaultHeight +
          buttonAccessibility +
          defaults.paddingHorizontal
        }
        onPress={toggleLocationTracking.bind(null, !shouldTrackLocation)}
        onLongPress={changeReturnPosition.bind(null, props)}
      />
      {destination && (
        <Fab
          type="material-community"
          iconName="directions"
          fabTop={fabTop}
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
      {deliveryStatus === 2 && (
        <Fab
          type={'material-community'}
          iconName={'refresh'}
          fabTop={fabTop}
          size={24}
          containerSize={56}
          color={colors.primary}
          left={10}
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
  returnPosition: null
};

Fabs.propTypes = {
  availableNavApps: PropTypes.array,
  buttonAccessibility: PropTypes.number,
  coords: PropTypes.object,
  deliveryStatus: PropTypes.number,
  fabTop: PropTypes.instanceOf(Animated.Value),
  mapPadding: PropTypes.object,
  processing: PropTypes.bool,
  refreshDriverData: PropTypes.func,
  returnPosition: PropTypes.object,
  selectedStopId: PropTypes.number,
  shouldTrackLocation: PropTypes.bool,
  stops: PropTypes.object,
  toggleLocationTracking: PropTypes.func,
  updateReturnPosition: PropTypes.func
};

const areEqual = (prevProps, nextProps) => {
  return !(
    prevProps.processing !== nextProps.processing ||
    prevProps.coords?.latitude !== nextProps.coords?.latitude ||
    prevProps.coords?.longitude !== nextProps.coords?.longitude ||
    prevProps.selectedStopId !== nextProps.selectedStopId ||
    prevProps.shouldTrackLocation !== nextProps.shouldTrackLocation ||
    prevProps.returnPosition?.latitude !== nextProps.returnPosition?.latitude ||
    prevProps.returnPosition?.longitude !== nextProps.returnPosition?.longitude
  );
};

export default React.memo(Fabs, areEqual);
