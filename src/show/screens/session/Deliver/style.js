import { StyleSheet } from 'react-native';

import { defaults } from 'Theme';

const style = StyleSheet.create({
  flex1: {
    flex: 1
  },
  fullWidth: {
    width: '100%'
  },
  photoWrapper: {
    borderRadius: defaults.borderRadius
  },
  cameraScanner: {
    ...StyleSheet.absoluteFill,
    zIndex: 1
  },
  cameraScannerOverlay: {
    zIndex: 2,
    backgroundColor: 'transparent'
  }
});

export default style;
