import { StyleSheet } from 'react-native';

export default ({ colors }) =>
  StyleSheet.create({
    containerStyle: {
      width: '100%'
    },
    disabled: {
      borderColor: colors.input
    },
    thumbStyle: {
      backgroundColor: colors.white,
      borderWidth: 2,
      borderColor: colors.primary,
      width: 22,
      height: 22,
      borderRadius: 11
    },
    trackStyle: {
      height: 2
    }
  });
