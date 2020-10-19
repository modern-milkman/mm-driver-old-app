import React from 'react';
import PropTypes from 'prop-types';

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
    coords: { latitude, longitude },
    mapPadding,
    selectedStopId,
    shouldTrackLocation,
    stops,
    toggleLocationTracking
  } = props;

  const source = { latitude, longitude };
  const destination =
    stops && selectedStopId && stops[selectedStopId]
      ? { ...stops[selectedStopId] }
      : null;

  return (
    <>
      <Fab
        type={'material-community'}
        iconName={'crosshairs-gps'}
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
  mapPadding: PropTypes.object,
  returnPosition: PropTypes.object,
  selectedStopId: PropTypes.number,
  shouldTrackLocation: PropTypes.bool,
  stops: PropTypes.object,
  toggleLocationTracking: PropTypes.func,
  updateReturnPosition: PropTypes.func
};

const areEqual = (prevProps, nextProps) => {
  return !(
    prevProps.coords.latitude !== nextProps.coords.latitude ||
    prevProps.coords.longitude !== nextProps.coords.longitude ||
    prevProps.selectedStopId !== nextProps.selectedStopId ||
    prevProps.shouldTrackLocation !== nextProps.shouldTrackLocation ||
    prevProps.returnPosition?.latitude !== nextProps.returnPosition?.latitude ||
    prevProps.returnPosition?.longitude !== nextProps.returnPosition?.longitude
  );
};

export default React.memo(Fabs, areEqual);
