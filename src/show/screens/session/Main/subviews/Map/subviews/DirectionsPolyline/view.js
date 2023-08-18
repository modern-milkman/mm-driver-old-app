/*
TODO
the strokeColor code can be changed to colors.inputSecondary only once we upgrade to RN .72+ with Appearance.setColorScheme available
Appearance.setColorScheme should be called on app init to force OS elements to display in the app's darkMode preference
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Appearance, Platform } from 'react-native';
import { Polyline } from 'react-native-maps';

import { RGB_COLORS } from 'Theme';
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
            : `rgb(${RGB_COLORS.inputSecondary[Appearance.getColorScheme()]})`
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
