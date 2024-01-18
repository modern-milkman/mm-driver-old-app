import I18n from 'i18next';

import { systemLanguage } from 'Helpers';

import en from './en';
import fr from './fr';

I18n.init({
  resources: {
    en,
    fr
  },
  lng: systemLanguage(),
  fallbackLng: 'en',
  whitelist: ['en', 'fr']
});

export default I18n;
