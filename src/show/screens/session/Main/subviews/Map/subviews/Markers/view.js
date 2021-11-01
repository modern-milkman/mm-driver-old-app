import React from 'react';
import PropTypes from 'prop-types';

import { deliveryStates as DS } from 'Helpers';

import { Marker } from '../';

const Markers = props => {
  const {
    completedStopsIds,
    mapMarkerSize,
    optimisedRouting,
    orderedStopsIds,
    selectedStopId,
    showDoneDeliveries,
    status
  } = props;

  const hasMarkers =
    status !== DS.SC &&
    (orderedStopsIds?.length > 0 || completedStopsIds?.length > 0);
  const disabled = [DS.NCI, DS.LV, DS.SSC, DS.SC].includes(status);

  return (
    (hasMarkers && (
      <>
        {orderedStopsIds?.map((sID, index) => (
          <Marker
            key={`${sID}-${mapMarkerSize}-${disabled}-${
              optimisedRouting ? index + 1 : 0
            }`}
            id={sID}
            disabled={disabled}
            {...(optimisedRouting && { sequence: index + 1 })}
          />
        ))}
        {showDoneDeliveries &&
          completedStopsIds?.map(sID => (
            <Marker
              key={`${sID}-${mapMarkerSize}-${disabled}`}
              id={sID}
              disabled={disabled}
              completed
            />
          ))}
        {!showDoneDeliveries && completedStopsIds.includes(selectedStopId) && (
          <Marker
            key={`${selectedStopId}-${mapMarkerSize}-${disabled}`}
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
  mapMarkerSize: PropTypes.number,
  optimisedRouting: PropTypes.bool,
  orderedStopsIds: PropTypes.array,
  selectedStopId: PropTypes.number,
  showDoneDeliveries: PropTypes.bool,
  status: PropTypes.string
};

export default Markers;
