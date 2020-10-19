import PropTypes from 'prop-types';
import { Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Marker as RNMMaker } from 'react-native-maps';

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

  const markerImages = {
    completed: require('Images/markers/completed.png'),
    default: require('Images/markers/default.png'),
    selected: require('Images/markers/selected.png')
  };

  const mapMarkerImageType =
    selectedStopId === id ? 'selected' : completed ? 'completed' : 'default';

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
      <RNMMaker
        coordinate={{
          latitude: selectedStop.latitude,
          longitude: selectedStop.longitude
        }}
        onPress={updateSelectedStop.bind(null, id)}
        anchor={{ x: 0, y: 1 }}
        {...(selectedStopId === id && { zIndex: 1 })}
        tracksViewChanges={tracksViewChanges}>
        <Image
          source={markerImages[mapMarkerImageType]}
          style={{ width: mapMarkerSize, height: mapMarkerSize }}
          resizeMode={'cover'}
        />
      </RNMMaker>
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
