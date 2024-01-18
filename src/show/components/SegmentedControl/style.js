import { StyleSheet } from 'react-native';

import { defaults } from 'Theme';

export default ({ colors }) =>
  StyleSheet.create({
    segment: {
      paddingVertical: defaults.marginVertical / 3,
      paddingHorizontal: defaults.marginHorizontal,
      borderColor: colors.primary,
      borderWidth: 2,
      borderRightWidth: 0,
      backgroundColor: colors.neutral
    },
    firstSegment: {
      borderTopLeftRadius: defaults.borderRadius,
      borderBottomLeftRadius: defaults.borderRadius
    },
    lastSegment: {
      borderTopRightRadius: defaults.borderRadius,
      borderBottomRightRadius: defaults.borderRadius,
      borderRightWidth: 2
    },
    selectedSegment: {
      backgroundColor: colors.primary
    }
  });
