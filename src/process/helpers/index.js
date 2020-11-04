import Config from 'react-native-config';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  NativeModules
} from 'react-native';

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
  if (parseInt(Config.RESET_HOUR_DAY) <= ukTimeNow()) {
    date.setDate(date.getDate() + 1);
  }
  return formatDate(date);
};

const defaultRoutes = {
  public: 'Home',
  session: 'Main'
};

const deviceFrame = () => Dimensions.get('window');

const formatDate = (date) =>
  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

const throttle = (func, wait = 100) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

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

const mock = () => null;

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

const statusBarHeight = () => {
  const { StatusBarManager } = NativeModules;
  return StatusBarManager.HEIGHT;
};

const ukTimeNow = () => {
  const date = new Date();
  return parseInt(
    date
      .toLocaleTimeString(undefined, {
        timeZone: 'Europe/London',
        hour12: false
      })
      .substring(0, 2)
  );
};

export {
  capitalize,
  checkAtLeastOneItem,
  currentDay,
  deviceFrame,
  defaultRoutes,
  formatDate,
  throttle,
  isAppInstalled,
  jiggleAnimation,
  mock,
  toggle,
  randomKey,
  statusBarHeight,
  ukTimeNow
};
