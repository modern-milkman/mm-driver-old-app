import PropTypes from 'prop-types';
import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Marker as RNMMarker } from 'react-native-maps';

import { colors, defaults } from 'Theme';

import style from './style';

const getCustomerSatisfactionColor = (satisfactionStatus) => {
  switch (satisfactionStatus) {
    case 1:
      return colors.primaryBright;
    case 2:
      return colors.success;
    case 3:
      return colors.warning;
    case 4:
      return colors.error;
    default:
      return colors.primary;
  }
};

const Marker = (props) => {
  const {
    completedStopsIds,
    id,
    mapMarkerSize,
    previousStopId,
    stops,
    selectedStopId,
    updateSelectedStop
  } = props;
  const selectedStop = stops[id] || null;
  const completed = completedStopsIds.includes(id);

  const customerSatisfactionColor = getCustomerSatisfactionColor(
    selectedStop.satisfactionStatus
  );
  const mapMarkerBackgroundColor =
    selectedStopId === id
      ? colors.secondary
      : completed
      ? colors.input
      : customerSatisfactionColor;

  const [previousMarkerSize, setPreviousMarkerSize] = useState(mapMarkerSize);
  const [tracksViewChanges, setTracksViewChanges] = useState(
    selectedStopId === id || previousStopId === id
  );

  useEffect(() => {
    setTracksViewChanges(
      selectedStopId === id ||
        previousStopId === id ||
        previousMarkerSize !== mapMarkerSize
    );
    if (previousMarkerSize !== mapMarkerSize) {
      setPreviousMarkerSize(mapMarkerSize);
    }
    setTimeout(() => {
      setTracksViewChanges(false);
    }, 125);
  }, [id, mapMarkerSize, previousMarkerSize, previousStopId, selectedStopId]);

  return (
    (selectedStop && (
      <RNMMarker
        coordinate={{
          latitude: selectedStop.latitude,
          longitude: selectedStop.longitude
        }}
        onPress={updateSelectedStop.bind(null, id)}
        anchor={{ x: 0.5, y: 1 }}
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
                  backgroundColor: customerSatisfactionColor
                }
              ]}
            />
          )}
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

Marker.defaultProps = {};

Marker.propTypes = {
  completedStopsIds: PropTypes.array,
  id: PropTypes.number,
  mapMarkerSize: PropTypes.number,
  previousStopId: PropTypes.number,
  stops: PropTypes.object,
  selectedStopId: PropTypes.number,
  updateSelectedStop: PropTypes.func
};

const areEqual = (prevProps, nextProps) => {
  return !(
    prevProps.mapMarkerSize !== nextProps.mapMarkerSize ||
    nextProps.selectedStopId === nextProps.id ||
    nextProps.previousStopId === nextProps.id
  );
};
export default React.memo(Marker, areEqual);
