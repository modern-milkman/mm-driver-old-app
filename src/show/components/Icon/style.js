import { Platform } from 'react-native';

export default {
  iconDefaultContainerSize: (containerSize) => ({
    width: containerSize,
    height: containerSize,
    justifyContent: 'center',
    alignItems: 'center'
  }),
  iconDefaultStyle: (containerSize) => {
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
  },
  circleStyle: (containerSize, iconSize) => {
    const circleSize = containerSize - (containerSize - iconSize) / 2;
    return {
      position: 'absolute',
      width: circleSize,
      height: circleSize,
      borderRadius: circleSize / 2
    };
  }
};
