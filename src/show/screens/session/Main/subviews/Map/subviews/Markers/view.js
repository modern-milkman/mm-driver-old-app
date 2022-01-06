import React from 'react';
import PropTypes from 'prop-types';

import { deliveryStates as DS } from 'Helpers';

import { Marker } from '../';

const Markers = props => {
  const {
    completedStopsIds,
    isOptimised,
    mapMarkerSize,
    optimisedStopsToShow,
    orderedStopsIds,
    outOfSequenceIds,
    selectedStopId,
    showAllPendingStops,
    showDoneDeliveries,
    status
  } = props;

  const hasMarkers =
    status !== DS.SC &&
    (orderedStopsIds?.length > 0 ||
      completedStopsIds?.length > 0 ||
      outOfSequenceIds?.length > 0);
  const disabled = [DS.NCI, DS.LV, DS.SSC, DS.SC].includes(status);

  return (
    (hasMarkers && (
      <>
        {orderedStopsIds?.map((sID, index) => (
          <Marker
            key={`osid-${sID}-${mapMarkerSize}-${disabled}-${index + 1}-${
              isOptimised ? 'ROON' : 'ROOFF'
            }`}
            id={sID}
            disabled={disabled}
            {...(isOptimised &&
              index < optimisedStopsToShow && { sequence: index + 1 })}
          />
        ))}
        {outOfSequenceIds?.map(sID => (
          <Marker
            key={`oosid-${sID}-${mapMarkerSize}-${disabled}`}
            id={sID}
            disabled={disabled}
          />
        ))}
        {showDoneDeliveries &&
          completedStopsIds?.map(sID => (
            <Marker
              key={`csid-${sID}-${mapMarkerSize}-${disabled}`}
              id={sID}
              disabled={disabled}
              completed
            />
          ))}
        {!showDoneDeliveries && completedStopsIds.includes(selectedStopId) && (
          <Marker
            key={`done-${selectedStopId}-${mapMarkerSize}-${disabled}`}
            id={selectedStopId}
            disabled={disabled}
            completed
          />
        )}
        {!showAllPendingStops &&
          !completedStopsIds.includes(selectedStopId) &&
          !orderedStopsIds.includes(selectedStopId) &&
          !outOfSequenceIds.includes(selectedStopId) && (
            <Marker
              key={`allpending-${selectedStopId}-${mapMarkerSize}-${disabled}`}
              id={selectedStopId}
              disabled={disabled}
              completed
            />
          )}
      </>
    )) ||
    null
  );
};

Markers.defaultProps = {};

Markers.propTypes = {
  completedStopsIds: PropTypes.array,
  isOptimised: PropTypes.bool,
  mapMarkerSize: PropTypes.number,
  optimisedStopsToShow: PropTypes.number,
  orderedStopsIds: PropTypes.array,
  outOfSequenceIds: PropTypes.array,
  selectedStopId: PropTypes.number,
  showAllPendingStops: PropTypes.bool,
  showDoneDeliveries: PropTypes.bool,
  status: PropTypes.string
};

export default Markers;
