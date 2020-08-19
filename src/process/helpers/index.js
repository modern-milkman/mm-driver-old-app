import { Animated, Dimensions, Easing, Linking } from 'react-native';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const deviceFrame = () => Dimensions.get('window');

const isAppInstalled = async (appName) => {
  return await Linking.canOpenURL(appName + '://')
    .then((installed) => {
      if (!installed) {
        return false;
      } else {
        return true;
      }
    })
    .catch(() => {
      return false;
    });
};

const jiggleAnimation = (animatedValue, callback) => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 35,
        easing: Easing.linear,
        useNativeDriver: false
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 35,
        easing: Easing.linear,
        useNativeDriver: false
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 17,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ]),
    {
      iterations: 3
    }
  ).start();
  if (callback) {
    callback();
  }
};

const mock = () => {};

const randomKey = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '');

export {
  capitalize,
  deviceFrame,
  isAppInstalled,
  jiggleAnimation,
  mock,
  randomKey
};
