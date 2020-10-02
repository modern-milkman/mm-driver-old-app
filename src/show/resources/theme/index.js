import { Platform } from 'react-native';

import { alphaColor } from './colors';

const iOShint = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowOpacity: 0.15,
  shadowRadius: 4
};

export * from './colors';

export const defaults = {
  borderRadius: 10,
  marginHorizontal: 24,
  marginVertical: 24,
  overlayBackground: alphaColor('secondary', 0.85),
  paddingHorizontal: 16,
  topNavigation: {
    height: 44,
    iconSize: 32
  }
};

export const sizes = {
  button: {
    large: 60,
    normal: 50,
    small: 40,
    step: 10
  },
  input: {
    large: 50,
    normal: 40,
    small: 30
  },
  marker: {
    large: 50,
    normal: 40,
    small: 30,
    step: 10
  },
  list: {
    height: 60,
    image: 44
  }
};

export const shadows = {
  button: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.17,
        shadowRadius: 10
      },
      android: {
        elevation: 8
      }
    })
  },
  hintLower: {
    ...Platform.select({
      ios: iOShint,
      android: {
        elevation: 3
      }
    })
  },
  hintHigher: {
    ...Platform.select({
      ios: iOShint,
      android: {
        elevation: 5
      }
    })
  },
  inner: {
    ...Platform.select({
      ios: {
        shadowColor: alphaColor('primary', 0.15),
        shadowOffset: {
          width: 0,
          height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1
      },
      android: {
        elevation: 8
      }
    })
  }
};
