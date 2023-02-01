import { StyleSheet } from 'react-native';

export default ({ theme, alphaColor, colors }) =>
  StyleSheet.create({
    containerStyle: {
      width: '100%'
    },
    disabled: {
      backgroundColor: colors.white,
      borderColor: colors.input
    },
    thumbStyle: {
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primary,
      width: 22,
      height: 22,
      borderRadius: 11
    },
    trackStyle: {
      backgroundColor: alphaColor('primary', theme === 'dark' ? 0.4 : 0.2),
      height: 4
    }
  });
