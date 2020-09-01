import Config from 'react-native-config';
import { Animated, Dimensions, Easing, Linking } from 'react-native';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const checkAtLeastOneItem = (items, statusId, exclude = false) => {
  if (items) {
    if (exclude) {
      return items.some((i) => i.delivery_stateID !== statusId);
    }

    return items.some((i) => i.delivery_stateID === statusId);
  }

  return false;
};

const currentDay = () => {
  const date = new Date();
  if (Config.RESET_HOUR_DAY <= new Date().getHours()) {
    date.setDate(date.getDate() + 1);
  }
  return formatDate(date);
};

const deviceFrame = () => Dimensions.get('window');

const formatDate = (date) =>
  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

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

const toggle = (collection, item) => {
  const duplicate = [...collection];
  var idx = duplicate.indexOf(item);
  if (idx !== -1) {
    duplicate.splice(idx, 1);
  } else {
    duplicate.push(item);
  }

  return duplicate;
};

const randomKey = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '');

export {
  capitalize,
  checkAtLeastOneItem,
  currentDay,
  deviceFrame,
  formatDate,
  isAppInstalled,
  jiggleAnimation,
  mock,
  toggle,
  randomKey
};
