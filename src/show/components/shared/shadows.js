import { Platform } from 'react-native';

import { alphaColor } from 'Theme/colors';

export default {
  defaultShadow: {
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
        elevation: 3.5
      }
    })
  }
};
