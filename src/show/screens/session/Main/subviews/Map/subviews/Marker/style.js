import { StyleSheet } from 'react-native';

import { colors } from 'Theme';

const styles = StyleSheet.create({
  marker: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3
  },
  markerCircle: {
    position: 'absolute',
    backgroundColor: colors.white
  },
  markerCircleCenter: {
    zIndex: 2
  },
  markerShadow: {
    position: 'absolute',
    backgroundColor: colors.secondaryDark,
    opacity: 0.3,
    transform: [{ rotateX: '55deg' }]
  }
});

export default styles;
