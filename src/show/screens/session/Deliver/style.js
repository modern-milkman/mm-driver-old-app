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
    borderRadius: defaults.borderRadius,
    marginRight: defaults.marginHorizontal / 2
  }
});

export default style;
