import React from 'react';
import PropTypes from 'prop-types';
import { Polyline } from 'react-native-maps';

import { useTheme } from 'Containers';

const DirectionsPolyline = ({ directionsPolyline }) => {
  const { colors } = useTheme();
  return (
    (directionsPolyline && directionsPolyline.length > 1 && (
      <Polyline
        strokeWidth={3}
        strokeColor={colors.inputSecondary}
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
