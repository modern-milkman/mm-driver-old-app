import React from 'react';
import PropTypes from 'prop-types';

import { deliveryStates as DS } from 'Helpers';

import { Marker } from '../';

const Markers = (props) => {
  const {
    completedStopsIds,
    mapMarkerSize,
    orderedStopsIds,
    selectedStopId,
    showDoneDeliveries,
    status
  } = props;

  const hasMarkers =
    [DS.NCI, DS.LV, DS.DEL, DS.SSC].includes(status) &&
    orderedStopsIds?.length > 0;
  const disabled = status !== DS.DEL;

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
  mapMarkerSize: PropTypes.number,
  orderedStopsIds: PropTypes.array,
  selectedStopId: PropTypes.number,
  showDoneDeliveries: PropTypes.bool,
  status: PropTypes.string
};

export default Markers;
