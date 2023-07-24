import { Platform } from 'react-native';

export default {
  disabledStyle: {
    backgroundColor: 'transparent'
  },
  iconDefaultContainerSize: containerSize => ({
    width: containerSize,
    height: containerSize,
    justifyContent: 'center',
    alignItems: 'center'
  }),
  iconDefaultStyle: containerSize => {
    let defaultStyle = {
      backgroundColor: 'transparent',
      textAlign: 'center'
    };

    switch (Platform.OS) {
      case 'android':
        defaultStyle = {
          ...defaultStyle,
          textAlignVertical: 'center'
        };
        break;
      case 'ios':
        defaultStyle = {
          ...defaultStyle,
          lineHeight: containerSize
        };
        break;
    }

    return defaultStyle;
  }
};
