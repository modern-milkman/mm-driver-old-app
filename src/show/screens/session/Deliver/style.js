import { StyleSheet } from 'react-native';

import { defaults } from 'Theme';

const style = StyleSheet.create({
  flex1: {
    flex: 1
  },
  fullView: {
    width: '100%',
    height: '100%'
  },
  fullWidth: {
    width: '100%'
  },
  image: {
    borderRadius: defaults.borderRadius
  }
});

export default style;
