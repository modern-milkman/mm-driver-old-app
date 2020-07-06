import { Animated, Easing } from 'react-native';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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

export { capitalize, jiggleAnimation, mock };
