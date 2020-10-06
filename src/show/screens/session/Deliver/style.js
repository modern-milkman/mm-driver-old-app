import { StyleSheet } from 'react-native';

import { defaults, sizes } from 'Theme';

const style = StyleSheet.create({
  flex1: {
    flex: 1
  },
  fullImage: {
    minWidth: '100%',
    minHeight: '100%'
  },
  fullWidth: {
    width: '100%'
  },
  image: {
    height: sizes.list.image,
    width: sizes.list.image,
    borderRadius: defaults.borderRadius
  },
  navigationWrapper: {
    position: 'absolute',
    zIndex: 2,
    width: '100%'
  }
});

export default style;
