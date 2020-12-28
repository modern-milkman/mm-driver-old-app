import React from 'react';
import PropTypes from 'prop-types';

import { Marker } from '../';

const Markers = (props) => {
  const {
    completedStopsIds,
    deliveryStatus,
    mapMarkerSize,
    orderedStopsIds,
    selectedStopId,
    showDoneDeliveries
  } = props;

  const hasMarkers = deliveryStatus < 3 && orderedStopsIds?.length > 0;
  const disabled = deliveryStatus < 2;

  return (
    (hasMarkers && (
      <>
        {orderedStopsIds?.map((sID) => (
          <Marker
            key={`${sID}-${mapMarkerSize}-${disabled}`}
            id={sID}
            disabled={disabled}
          />
        ))}
        {showDoneDeliveries &&
          completedStopsIds?.map((sID) => (
            <Marker
              key={`${sID}-${mapMarkerSize}-${disabled}`}
              id={sID}
              disabled={disabled}
            />
          ))}
        {!showDoneDeliveries && completedStopsIds.includes(selectedStopId) && (
          <Marker
            key={`${selectedStopId}-${mapMarkerSize}-${disabled}`}
            id={selectedStopId}
            disabled={disabled}
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
  deliveryStatus: PropTypes.number,
  mapMarkerSize: PropTypes.number,
  orderedStopsIds: PropTypes.array,
  selectedStopId: PropTypes.number,
  showDoneDeliveries: PropTypes.bool
};

export default Markers;
