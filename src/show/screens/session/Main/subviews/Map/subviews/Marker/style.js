import { StyleSheet } from 'react-native';

export default ({ colors }) =>
  StyleSheet.create({
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
      backgroundColor: colors.inputDarkDark,
      opacity: 0.3,
      transform: [{ rotateX: '55deg' }]
    }
  });
