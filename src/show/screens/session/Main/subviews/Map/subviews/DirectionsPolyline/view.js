import React from 'react';
import PropTypes from 'prop-types';
import { Polyline } from 'react-native-maps';

import { colors } from 'Theme';

const DirectionsPolyline = ({ directionsPolyline }) => {
  return (
    (directionsPolyline && directionsPolyline.length > 1 && (
      <Polyline
        strokeWidth={3}
        strokeColor={colors.secondary}
        coordinates={directionsPolyline}
        geodesic
      />
    )) ||
    null
  );
};

DirectionsPolyline.defaultProps = {
  directionsPolyline: []
};

DirectionsPolyline.propTypes = {
  directionsPolyline: PropTypes.array
};

export default DirectionsPolyline;
