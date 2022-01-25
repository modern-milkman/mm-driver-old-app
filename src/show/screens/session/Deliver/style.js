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
    height: sizes.list.image,
    width: sizes.list.image,
    borderRadius: defaults.borderRadius,
    marginRight: defaults.marginHorizontal / 2
  }
});

export default style;
