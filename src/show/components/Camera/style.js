import { StyleSheet } from 'react-native';

export default ({ colors }) =>
  StyleSheet.create({
    cameraScanner: {
      ...StyleSheet.absoluteFill,
      zIndex: 1,
      backgroundColor: 'transparent'
    },
    imageOverlay: {
      ...StyleSheet.absoluteFill,
      flex: 1,
      zIndex: 2
    },
    cameraScannerOverlay: {
      zIndex: 3,
      backgroundColor: 'transparent'
    },
    flex: {
      flex: 1
    },
    opaque: {
      backgroundColor: colors.blackOnly
    }
  });
