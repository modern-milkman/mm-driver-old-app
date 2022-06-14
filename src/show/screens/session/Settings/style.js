import { StyleSheet } from 'react-native';

import { defaults } from 'Theme';

export default StyleSheet.create({
  pressableRow: {
    flexDirection: 'row',
    paddingVertical: defaults.marginVertical / 2,
    paddingHorizontal: defaults.marginHorizontal
  }
});
