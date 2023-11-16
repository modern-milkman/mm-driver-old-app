import { StyleSheet } from 'react-native';

import { defaults, sizes } from 'Theme';

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
  closeButton: {
    top: 40,
    right: 20,
    height: sizes.button.normal,
    width: sizes.button.normal,
    position: 'absolute',
    zIndex: 1
  },
  manualWrapper: {
    position: 'absolute',
    left: 0,
    bottom: 60,
    right: 0,
    zIndex: 1
  },
  flash: {
    bottom: 240,
    right: 20,
    position: 'absolute',
    zIndex: 1,
    borderRadius: 4,
    padding: defaults.marginVertical / 4
  }
});

export default style;
