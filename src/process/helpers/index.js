import { Base64 } from 'js-base64';
import Config from 'react-native-config';
import { useEffect, useRef } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import {
  Animated,
  Easing,
  Dimensions,
  Linking,
  NativeModules,
  Platform,
  StatusBar
} from 'react-native';

import I18n from 'Locales/I18n';
import Alert from 'Services/alert';
import actionSheet from 'Services/actionSheet';
import Analytics, { EVENTS } from 'Services/analytics';

import slack from './slack';

const actionSheetSwitch = ({ label, list, method }) => {
  const options = [];
  for (const element of list) {
    options[I18n.t(`${label}:${element}`)] = method.bind(null, element);
  }
  actionSheet(options);
};

const addZero = i => (i < 10 ? `0${i}` : i);

const appVersionString = props => {
  return Config.ENVIRONMENT !== 'production' || props?.diagnostics
    ? `V: ${Config.APP_VERSION_NAME}-${Config.APP_VERSION_CODE} ${Config.ENVIRONMENT}`
    : `Version ${Config.APP_VERSION_NAME}`;
};

const availableCountries = ['fr', 'uk'];
const availableLanguages = ['en', 'fr'];

const base64ToHex = base64 => {
  return [...Base64.atob(base64)]
    .map(c => c.charCodeAt(0).toString(16).padStart(2, 0))
    .join('')
    .toUpperCase();
};

const blacklists = {
  apiEndpointFailureTracking: [
    `${Config.FLEET_TRACKER_URL}/drivers`,
    '/Security/Logon',
    `${Config.SLACK_CRASH_WEBHOOK}`,
    `${Config.SLACK_FAILED_WEBHOOK}`
  ],
  apiEndpointOfflineTracking: [
    `${Config.FLEET_TRACKER_URL}/drivers`,
    '/Security/Logon',
    '/Security/Refresh',
    `${Config.SLACK_CRASH_WEBHOOK}`,
    `${Config.SLACK_FAILED_WEBHOOK}`
  ],
  addToStackRoute: ['PermissionsMissing', 'CustomerIssueModal'],
  resetStackRoutes: ['CheckIn'],
  transientReset: [
    'EmptiesCollected',
    'Home',
    'RegistrationMileage',
    'CustomerIssueModal'
  ]
};

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

const defaultRoutes = {
  public: 'Home',
  session: 'Main'
};

const deleteObjectKey = (obj, key) => {
  const { [key]: _, ...rest } = obj;
  return rest;
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

const deliverProductsDisabled = ({ checklist, status }) =>
  checklist?.shiftStartVanChecks === false ||
  checklist?.loadedVan === false ||
  [deliveryStates.DELC, deliveryStates.SEC, deliveryStates.SC].includes(status);

const deviceFrame = () => {
  const deviceHeight = Dimensions.get('screen').height;
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  const statusBarHeight = StatusBar.currentHeight;
  const bottomNavBarHeight = deviceHeight - (windowHeight + statusBarHeight);
  if (bottomNavBarHeight > 0) {
    return { height: windowHeight + statusBarHeight, width: windowWidth };
  } else {
    return { height: windowHeight, width: windowWidth };
  }
};

const distance = (p, q, unit) => {
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //:::                                                                         :::
  //:::  This routine calculates the distance between two points (given the     :::
  //:::  latitude/longitude of those points). It is being used to calculate     :::
  //:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
  //:::                                                                         :::
  //:::  Definitions:                                                           :::
  //:::    South latitudes are negative, east longitudes are positive           :::
  //:::                                                                         :::
  //:::  Passed to function:                                                    :::
  //:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
  //:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
  //:::    unit = the unit you desire for results                               :::
  //:::           where: 'M' is statute miles (default)                         :::
  //:::                  'K' is kilometers                                      :::
  //:::                  'N' is nautical miles                                  :::
  //:::                  'ME' is meters                                         :::
  //:::                                                                         :::
  //:::  Worldwide cities and other features databases with latitude longitude  :::
  //:::  are available at https://www.geodatasource.com                         :::
  //:::                                                                         :::
  //:::  For enquiries, please contact sales@geodatasource.com                  :::
  //:::                                                                         :::
  //:::  Official Web site: https://www.geodatasource.com                       :::
  //:::                                                                         :::
  //:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
  //:::                                                                         :::
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  const { x: lat1, y: lon1 } = p;
  const { x: lat2, y: lon2 } = q;
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === 'K') {
      dist = dist * 1.609344;
    }
    if (unit === 'N') {
      dist = dist * 0.8684;
    }
    if (unit === 'ME') {
      dist = dist * 1609.344;
    }
    return dist;
  }
};

const formatDate = date =>
  `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

const formatDateTime = date =>
  `${addZero(date.getDate())}${addZero(
    date.getMonth() + 1
  )}${date.getFullYear()}.${addZero(date.getHours())}${addZero(
    date.getMinutes()
  )}${addZero(date.getSeconds())}`;

const preopenPicker = ({ addImage, deletePhoto, key, reviewPhoto, title }) => {
  const pickerOptions = {};
  let destructiveButtonIndex = null;
  if (reviewPhoto) {
    pickerOptions[I18n.t('general:reviewPhoto')] = reviewPhoto;
  }
  if (addImage) {
    pickerOptions[I18n.t('general:takePhoto')] = openPicker.bind(null, {
      addImage,
      key,
      method: 'openCamera'
    });
    pickerOptions[I18n.t('general:openGalery')] = openPicker.bind(null, {
      addImage,
      key,
      method: 'openPicker'
    });
  }
  if (deletePhoto) {
    pickerOptions[I18n.t('general:deletePhoto')] = deletePhoto;
    destructiveButtonIndex = 4;
  }
  if (key && addImage) {
    actionSheet(pickerOptions, { destructiveButtonIndex, title });
  }
};

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

const openPicker = ({ addImage, key, method }) => {
  const event =
    method === 'openCamera'
      ? EVENTS.IMAGE_PICKER_FROM_CAMERA
      : 'openPicker'
      ? EVENTS.IMAGE_PICKER_FROM_PHOTO_LIBRARY
      : EVENTS.IMAGE_PICKER_FROM_NULL;

  Analytics.trackEvent(event);

  ImagePicker[method]({
    width: 1000,
    height: 1000,
    compressImageQuality: 0.6,
    cropping: true,
    includeBase64: true
  }).then(img => {
    addImage(key, img.path, img.mime);
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

const systemLanguage = () => {
  let language;
  if (Platform.OS === 'ios') {
    language = NativeModules.SettingsManager.settings.AppleLocale; // "fr_FR"
    if (language === undefined) {
      // iOS 13 workaround, take first of AppleLanguages array  ["en", "en-NZ"]
      language = NativeModules.SettingsManager.settings.AppleLanguages[0];
    }
  } else {
    if (NativeModules.I18nManager) {
      language = NativeModules.I18nManager.localeIdentifier;
    }
  }

  if (typeof language === 'undefined') {
    language = Config.DEFAULT_LANGUAGE;
  }

  return language.substring(0, 2);
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
  actionSheetSwitch,
  appVersionString,
  availableCountries,
  availableLanguages,
  base64ToHex,
  blacklists,
  capitalize,
  deliverProductsDisabled,
  deliveredStatuses,
  deliveryStates,
  deleteObjectKey,
  deviceFrame,
  defaultRoutes,
  distance,
  formatDate,
  formatDateTime,
  isAppInstalled,
  jiggleAnimation,
  mock,
  openDriverUpdate,
  openPicker,
  openURL,
  plateRecognition,
  preopenPicker,
  randomKey,
  slack,
  statusBarHeight,
  systemLanguage,
  timeToHMArray,
  timeoutResponseStatuses,
  toggle,
  triggerDriverUpdate,
  ukTimeNow,
  usePrevious
};
