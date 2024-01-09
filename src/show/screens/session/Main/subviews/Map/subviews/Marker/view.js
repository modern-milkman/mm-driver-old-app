import PropTypes from 'prop-types';
import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Marker as RNMMarker } from 'react-native-maps';

import { Text } from 'Components';
import { defaults } from 'Theme';
import { useTheme, useThemedStyles } from 'Containers';

import { mock } from 'Helpers';

import unthemedStyle from './style';

const getCustomerSatisfactionColor = ({
  colors,
  has3PLProducts,
  satisfactionStatus
}) => {
  switch (satisfactionStatus) {
    case 1:
      return colors.success;
    case 2:
      return colors.primaryBright;
    case 3:
      return colors.warning;
    case 4:
      return colors.error;
    default:
      return has3PLProducts ? colors.tpl : colors.primary;
  }
};

const markerOnPress = ({ updateProps, updateSelectedStop, id }) => {
  updateSelectedStop(id);
};

const renderSequence = ({ colors, id, selectedStopId, sequence }) => {
  return sequence && selectedStopId !== id ? (
    <View style={{ transform: [{ rotateZ: '45deg' }] }}>
      <Text.Input color={colors.inputSecondary}>{sequence}</Text.Input>
    </View>
  ) : null;
};

const Marker = props => {
  const { colors } = useTheme();
  const style = useThemedStyles(unthemedStyle);
  const {
    completedStopsIds,
    darkMode,
    disabled,
    id,
    mapMarkerSize,
    previousStopId,
    stops,
    selectedStopId,
    sequence,
    updateProps,
    updateSelectedStop
  } = props;
  const selectedStop = stops[id] || null;
  const completed = completedStopsIds.includes(id);

  const customerSatisfactionColor = getCustomerSatisfactionColor({
    colors,
    has3PLProducts: selectedStop?.has3PLProducts,
    satisfactionStatus: selectedStop?.satisfactionStatus
  });

  const mapMarkerBackgroundColor =
    selectedStopId === id
      ? colors.inputSecondary
      : completed
        ? colors.input
        : customerSatisfactionColor;

  const [previousDarkMode, setPreviousDarkMode] = useState(darkMode);
  const [previousMarkerSize, setPreviousMarkerSize] = useState(mapMarkerSize);
  const [previousSequence, setPreviousSequence] = useState(sequence);
  const [tracksViewChanges, setTracksViewChanges] = useState(
    selectedStopId === id || previousStopId === id
  );

  useEffect(() => {
    setTracksViewChanges(
      selectedStopId === id ||
        previousStopId === id ||
        previousDarkMode !== darkMode ||
        previousMarkerSize !== mapMarkerSize ||
        previousSequence !== sequence
    );
    if (previousDarkMode !== darkMode) {
      setPreviousDarkMode(darkMode);
    }
    if (previousMarkerSize !== mapMarkerSize) {
      setPreviousMarkerSize(mapMarkerSize);
    }
    if (previousSequence !== sequence) {
      setPreviousSequence(sequence);
    }
    setTimeout(() => {
      setTracksViewChanges(false);
    }, 125);
  }, [
    darkMode,
    id,
    mapMarkerSize,
    previousDarkMode,
    previousMarkerSize,
    previousSequence,
    previousStopId,
    selectedStopId,
    sequence
  ]);

  return (
    (selectedStop && (
      <RNMMarker
        coordinate={{
          latitude: selectedStop.latitude,
          longitude: selectedStop.longitude
        }}
        onPress={
          disabled || selectedStopId === id
            ? mock
            : markerOnPress.bind(null, { updateProps, updateSelectedStop, id })
        }
        anchor={{ x: 0.5, y: 1 }}
        {...(completed && { zIndex: -1 })}
        {...(selectedStopId === id && { zIndex: 1 })}
        tracksViewChanges={tracksViewChanges}>
        <View
          style={[
            style.marker,
            {
              backgroundColor: mapMarkerBackgroundColor,
              width: mapMarkerSize,
              height: mapMarkerSize,
              borderBottomRightRadius: mapMarkerSize / 2,
              borderTopLeftRadius: mapMarkerSize / 2,
              borderTopRightRadius: mapMarkerSize / 2,
              borderBottomLeftRadius: defaults.borderRadius / 2,
              borderColor: colors.white,
              transform: [{ rotateZ: '-45deg' }],
              marginBottom: mapMarkerSize / 3
            }
          ]}>
          <View
            style={[
              style.markerCircle,
              {
                width: mapMarkerSize / 1.7,
                height: mapMarkerSize / 1.7,
                borderRadius: mapMarkerSize / 3.4
              }
            ]}
          />
          {selectedStopId === id && (
            <View
              style={[
                style.markerCircle,
                style.markerCircleCenter,
                {
                  width: mapMarkerSize / 4,
                  height: mapMarkerSize / 4,
                  borderRadius: mapMarkerSize / 8,
                  backgroundColor: completed
                    ? colors.input
                    : customerSatisfactionColor
                }
              ]}
            />
          )}
          {renderSequence({ colors, id, selectedStopId, sequence })}
        </View>
        {selectedStopId === id && (
          <View
            style={[
              style.markerShadow,
              {
                left: mapMarkerSize / 4,
                top: mapMarkerSize * 0.9,
                width: mapMarkerSize / 2,
                height: mapMarkerSize / 2,
                borderRadius: mapMarkerSize / 4
              }
            ]}
          />
        )}
      </RNMMarker>
    )) ||
    null
  );
};

Marker.defaultProps = {
  completed: false,
  disabled: false,
  sequence: null
};

Marker.propTypes = {
  completed: PropTypes.bool,
  completedStopsIds: PropTypes.array,
  darkMode: PropTypes.bool,
  disabled: PropTypes.bool,
  id: PropTypes.number,
  mapMarkerSize: PropTypes.number,
  previousStopId: PropTypes.number,
  stops: PropTypes.object,
  selectedStopId: PropTypes.number,
  sequence: PropTypes.number,
  updateProps: PropTypes.func,
  updateSelectedStop: PropTypes.func
};

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.completed === nextProps.completed &&
    prevProps.mapMarkerSize === nextProps.mapMarkerSize &&
    prevProps.sequence === nextProps.sequence &&
    nextProps.selectedStopId !== nextProps.id &&
    nextProps.previousStopId !== nextProps.id
  );
};
export default React.memo(Marker, areEqual);
