import Config from 'react-native-config';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  NativeModules
} from 'react-native';

import { colors } from 'Theme';
import I18n from 'Locales/I18n';
import Alert from 'Services/alert';

const blacklistApiEndpointFailureTracking = [
  `${Config.FLEET_TRACKER_URL}/drivers`
];

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

const customerSatisfactionColor = (satisfactionStatus) => {
  switch (satisfactionStatus) {
    case 1:
      return colors.primaryBright;
    case 2:
      return colors.success;
    case 3:
      return colors.warning;
    case 4:
      return colors.error;
    default:
      return colors.primary;
  }
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

const openDriverUpdate = () => {
  Linking.openURL(Config.GET_DRIVER_URL).catch(() => {
    Alert({
      title: I18n.t('alert:cannotOpenUrl.title'),
      message: I18n.t('alert:cannotOpenUrl.message'),
      buttons: [
        {
          text: I18n.t('general:ok'),
          style: 'cancel'
        }
      ]
    });
  });
};

const timeToHMArray = (time) => time.split(':').map((hm) => parseInt(hm));

const triggerDriverUpdate = (url) => {
  Linking.openURL(url).catch(() => {
    Alert({
      title: I18n.t('alert:cannotUpgrade.title'),
      message: I18n.t('alert:cannotUpgrade.message'),
      buttons: [
        {
          text: I18n.t('general:ok'),
          style: 'cancel'
        }
      ]
    });
  });
};

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

const ukTimeNow = (secondsFromMidnight = false) => {
  const date = new Date();
  const stringDate = date
    .toLocaleTimeString(undefined, {
      timeZone: 'Europe/London',
      hour12: false
    })
    .substring(0, 5);
  const [h, m] = timeToHMArray(stringDate);
  return secondsFromMidnight ? h * 60 * 60 + m * 60 : stringDate;
};

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export {
  blacklistApiEndpointFailureTracking,
  capitalize,
  checkAtLeastOneItem,
  customerSatisfactionColor,
  deviceFrame,
  defaultRoutes,
  formatDate,
  throttle,
  isAppInstalled,
  jiggleAnimation,
  mock,
  openDriverUpdate,
  timeToHMArray,
  toggle,
  triggerDriverUpdate,
  randomKey,
  statusBarHeight,
  ukTimeNow,
  usePrevious
};
