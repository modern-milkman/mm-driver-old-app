import { Platform } from 'react-native';

import { colors } from 'Theme';
import { shadows } from 'Components/shared';

import Types from './Types';

export const style = {
  container: {
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 16,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center'
  },
  touchableWrapper: {
    width: '100%'
  },
  [Types.CTA]: {
    backgroundStyle: {
      backgroundColor: colors.accent
    },
    textStyle: {
      color: colors.standard
    }
  },
  [Types.DESTROY]: {
    backgroundStyle: {
      backgroundColor: colors.error
    },
    textStyle: {
      color: colors.standard
    }
  },
  [Types.PLAIN]: {
    backgroundStyle: {
      backgroundColor: 'transparent'
    },
    textStyle: {
      color: colors.primary
    }
  },
  [Types.PRIMARY]: {
    backgroundStyle: {
      backgroundColor: colors.primary
    },
    textStyle: {
      color: colors.standard
    }
  },

  disabled: {
    backgroundStyle: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.secondary,
      ...Platform.select({
        android: {
          elevation: 0
        }
      })
    },
    textStyle: {
      color: colors.secondary
    }
  },
  iconStyleContainer: {
    right: 10,
    justifyContent: 'center'
  },
  shadow: {
    ...shadows.defaultShadow
  },
  leftIcon: {
    marginLeft: 5
  },
  rightIcon: {
    marginRight: 10
  }
};
