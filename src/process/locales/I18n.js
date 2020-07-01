import { NativeModules, Platform } from 'react-native';
import I18n from 'i18next';

import en from './en';

function getSystemLocale() {
  let locale;
  if (Platform.OS === 'ios') {
    locale = NativeModules.SettingsManager.settings.AppleLocale; // "fr_FR"
    if (locale === undefined) {
      // iOS 13 workaround, take first of AppleLanguages array  ["en", "en-NZ"]
      locale = NativeModules.SettingsManager.settings.AppleLanguages[0];
    }
  } else {
    if (NativeModules.I18nManager) {
      locale = NativeModules.I18nManager.localeIdentifier;
    }
  }

  if (typeof locale === 'undefined') {
    return 'en';
  }

  return locale.slice(0, 2);
}

I18n.init({
  resources: {
    en
  },
  lng: getSystemLocale(),
  fallbackLng: 'en',
  whitelist: ['en']
});

export default I18n;
