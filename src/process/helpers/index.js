import Config from 'react-native-config';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  NativeModules
} from 'react-native';
import { Base64 } from 'js-base64';

import { colors } from 'Theme';
import I18n from 'Locales/I18n';
import Alert from 'Services/alert';

const appVersionString = () =>
  Config.ENVIRONMENT !== 'production'
    ? `V: ${Config.APP_VERSION_NAME}-${Config.APP_VERSION_CODE} ${Config.ENVIRONMENT}`
    : `Version ${Config.APP_VERSION_NAME}`;

const base64ToHex = base64 => {
  return [...Base64.atob(base64)]
    .map(c => c.charCodeAt(0).toString(16).padStart(2, 0))
    .join('')
    .toUpperCase();
};

const blacklists = {
  apiEndpointFailureTracking: [
    `${Config.FLEET_TRACKER_URL}/drivers`,
    '/Security/Logon'
  ],
  apiEndpointOfflineTracking: [
    `${Config.FLEET_TRACKER_URL}/drivers`,
    '/Security/Logon',
    '/Security/Refresh'
  ],
  addToStackRoute: [
    'CustomerIssueModal',
    'LowConnectionModal',
    'PermissionsMissing',
    'UpgradeApp'
  ],
  resetStackRoutes: ['CheckIn'],
  transientReset: ['RegistrationMileage', 'Home']
};

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

const customerSatisfactionColor = satisfactionStatus => {
  // https://themodernmilkman.atlassian.net/wiki/spaces/VN/pages/1523679232/Customer+Issues#Map-pin-markers

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

const deliveryStates = {
  DEL: 'Delivering',
  DELC: 'Delivery Complete',
  NCI: 'Not Checked In',
  LV: 'Loading Van',
  SSC: 'Shift Start Checks',
  SEC: 'Shift End Checks',
  SC: 'Shift Completed'
};

const deliveredStatuses = ['completed', 'rejected'];

const deviceFrame = () => Dimensions.get('window');

const formatDate = date =>
  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

const isAppInstalled = async appName => {
  return await Linking.canOpenURL(appName + '://')
    .then(installed => {
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

const openURL = url => {
  Linking.openURL(url);
};

const plateRecognition = (search, plates) => {
  let plateRecognized = '';
  const kCharMatched = 5;

  for (
    let i = 0;
    i < plates.length && plateRecognized.length === 0 && search.length === 7;
    i++
  ) {
    const plateSpellCheckking = [
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ];

    for (let j = 0; j < search.length; j++) {
      if (plates[i][j] === search[j]) {
        plateSpellCheckking.push(true);
      }
    }

    if (plateSpellCheckking.reduce((a, item) => a + item, 0) >= kCharMatched) {
      plateRecognized = plates[i];
    }
  }

  return plateRecognized;
};

const randomKey = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '');

const statusBarHeight = () => {
  const { StatusBarManager } = NativeModules;
  return StatusBarManager.HEIGHT;
};

const throttle = (func, wait = 100) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

const timeoutResponseStatuses = ['TIMEOUT', 502, 503, 504, 507];

const timeToHMArray = time => time.split(':').map(hm => parseInt(hm));

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

const triggerDriverUpdate = url => {
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

const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export {
  appVersionString,
  base64ToHex,
  blacklists,
  capitalize,
  customerSatisfactionColor,
  deliveredStatuses,
  deliveryStates,
  deviceFrame,
  defaultRoutes,
  formatDate,
  throttle,
  isAppInstalled,
  jiggleAnimation,
  mock,
  openDriverUpdate,
  openURL,
  plateRecognition,
  randomKey,
  statusBarHeight,
  timeToHMArray,
  timeoutResponseStatuses,
  toggle,
  triggerDriverUpdate,
  ukTimeNow,
  usePrevious
};
