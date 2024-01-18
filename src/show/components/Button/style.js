import { StyleSheet } from 'react-native';

import { defaults } from 'Theme';

import Types from './Types';

export default ({ alphaColor, colors }) =>
  StyleSheet.create({
    container: {
      width: '100%',
      borderRadius: defaults.borderRadius,
      justifyContent: 'center',
      alignItems: 'center'
    },
    touchableWrapper: {
      width: '100%'
    },
    [Types.ERROR]: {
      backgroundStyle: {
        backgroundColor: colors.error
      },
      textStyle: {
        color: colors.white
      },
      activityIndicatorColor: colors.white
    },
    [Types.OUTLINE]: {
      backgroundStyle: {
        backgroundColor: colors.neutral,
        borderColor: colors.inputSecondary,
        borderWidth: 1
      },
      textStyle: {
        color: colors.inputSecondary
      },
      activityIndicatorColor: colors.primary
    },
    [Types.PRIMARY]: {
      backgroundStyle: {
        backgroundColor: colors.primary
      },
      textStyle: {
        color: colors.white
      },
      activityIndicatorColor: colors.white
    },
    [Types.SECONDARY]: {
      backgroundStyle: {
        backgroundColor: colors.inputSecondary
      },
      textStyle: {
        color: colors.white
      },
      activityIndicatorColor: colors.white
    },
    [Types.TERTIARY]: {
      backgroundStyle: {
        backgroundColor: colors.neutral
      },
      textStyle: {
        color: colors.inputSecondary
      },
      activityIndicatorColor: colors.primary
    },

    absolute: {
      position: 'absolute',
      width: '100%'
    },
    disabled: {
      backgroundColor: colors.input,
      textStyle: {
        color: colors.white
      },
      borderWidth: 0
    },

    iconStyleContainer: {
      position: 'absolute',
      right: defaults.paddingHorizontal / 2,
      justifyContent: 'center'
    },
    leftIcon: {
      position: 'absolute',
      left: defaults.paddingHorizontal / 2
    },
    rightIcon: {
      position: 'absolute',
      right: defaults.paddingHorizontal / 2
    },
    noBorderRadius: {
      borderRadius: 0
    }
  });
