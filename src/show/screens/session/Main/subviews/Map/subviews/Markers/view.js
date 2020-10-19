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

  return (
    (deliveryStatus === 2 && (
      <>
        {orderedStopsIds?.map((sID) => (
          <Marker key={`${sID}-${mapMarkerSize}`} id={sID} />
        ))}
        {showDoneDeliveries &&
          completedStopsIds?.map((sID) => (
            <Marker key={`${sID}-${mapMarkerSize}`} id={sID} />
          ))}
        {!showDoneDeliveries && completedStopsIds.includes(selectedStopId) && (
          <Marker
            key={`${selectedStopId}-${mapMarkerSize}`}
            id={selectedStopId}
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
