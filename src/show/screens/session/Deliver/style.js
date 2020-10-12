import { StyleSheet } from 'react-native';

import { defaults, sizes } from 'Theme';

const style = StyleSheet.create({
  flex1: {
    flex: 1
  },
  fullView: {
    width: '100%',
    height: '100%'
  },
  fullImage: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    marginVertical: defaults.marginVertical
  },
  fullWidth: {
    width: '100%'
  },
  image: {
    height: sizes.list.image,
    width: sizes.list.image,
    borderRadius: defaults.borderRadius
  }
});

export default style;
