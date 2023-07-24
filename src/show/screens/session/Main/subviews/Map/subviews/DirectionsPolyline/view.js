import React from 'react';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';
import { Polyline } from 'react-native-maps';

import { useTheme } from 'Containers';

const DirectionsPolyline = ({ directionsPolyline }) => {
  const { colors } = useTheme();

  return (
    (directionsPolyline && directionsPolyline.length > 1 && (
      <Polyline
        strokeWidth={3}
        strokeColor={
          Platform.OS === 'android'
            ? colors.inputSecondary
            : colors.inputPrimary
        }
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
