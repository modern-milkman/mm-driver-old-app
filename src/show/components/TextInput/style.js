import { Platform } from 'react-native';
import { systemWeights } from 'react-native-typography';

import { colors } from 'Theme';

const iconCloseStyle = (disabledErrors) => ({
  position: 'absolute',
  right: 5,
  ...Platform.select({
    ios: {
      bottom: disabledErrors ? 12 : 49
    },
    android: {
      bottom: disabledErrors ? 15 : 53
    }
  })
});

const style = {
  h45: {
    minHeight: 45
  },
  textInput: {
    ...systemWeights.semibold,
    color: colors.primary,
    borderBottomWidth: 1,
    borderColor: colors.secondaryLight,
    paddingRight: 30,
    paddingVertical: 12,
    width: '100%',
    ...Platform.select({
      ios: {
        fontSize: 16
      },
      android: {
        fontSize: 14,
        lineHeight: 16
      }
    })
  },
  darkModeTextInput: {
    color: colors.standard,
    borderColor: colors.standard
  },
  textInputFocused: {
    borderColor: colors.primary
  },
  textInputError: {
    borderColor: colors.error
  },
  iconError: {
    color: colors.error
  },
  iconClose: iconCloseStyle.bind(this),
  iconCloseColor: {
    color: colors.primary,
    darkColor: colors.standard
  }
};

export default style;
