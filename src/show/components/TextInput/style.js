import { StyleSheet } from 'react-native';
import { systemWeights } from 'react-native-typography';

import { defaults, sizes as themeSizes } from 'Theme';

export const sizes = {
  borderRadius: defaults.borderRadius,
  defaultPadding: defaults.paddingHorizontal,
  doubleBorderWidth: 4,
  errorsHeight: 28,
  large: themeSizes.input.large,
  normal: themeSizes.input.normal,
  small: themeSizes.input.small
};

export default ({ colors }) =>
  StyleSheet.create({
    inputBorderWrapper: {
      flex: 1,
      borderWidth: 2,
      borderRadius: sizes.borderRadius
    },
    inputWrapper: {
      flex: 1,
      borderWidth: 1,
      borderRadius: sizes.borderRadius,
      backgroundColor: colors.white
    },
    input: {
      flex: 1,
      fontSize: 18,
      color: colors.inputSecondary,
      ...systemWeights.semibold
    }
  });
