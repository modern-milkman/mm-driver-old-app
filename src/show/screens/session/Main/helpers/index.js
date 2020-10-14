import I18n from 'Locales/I18n';
import { Linking } from 'react-native';

import Alert from 'Services/alert';
import actionSheet from 'Services/actionSheet';

import configuration from './configuration';

const appName = (type) => {
  switch (type) {
    case 'maps':
      return 'Apple Maps';

    case 'comgooglemaps':
    case 'geo':
      return 'Google Maps';

    case 'waze':
      return 'Waze';
  }
};

const navigateInSheet = ({
  availableNavApps,
  source,
  destination = { latitude: null, longitude: null },
  lookForGasStation = false
}) => {
  const actions = {};
  if (availableNavApps.length === 1) {
    openNavigation({
      type: availableNavApps[0],
      source,
      destination,
      lookForGasStation
    });
    return;
  }

  for (const type of availableNavApps) {
    actions[
      `${I18n.t('screens:main.actions.openIn', { appName: appName(type) })}`
    ] = openNavigation.bind(null, {
      type,
      source,
      destination,
      lookForGasStation
    });
  }

  actionSheet(actions);
};

const openNavigation = ({
  type,
  source: { latitude: sLatitude, longitude: sLongitude },
  destination: { latitude: dLatitude, longitude: dLongitude },
  lookForGasStation
}) => {
  let url;

  switch (type) {
    case 'maps': {
      url = lookForGasStation
        ? `maps://${sLatitude},${sLongitude}?q=Gas+stations`
        : `maps://${sLatitude},${sLongitude}?daddr=${dLatitude},${dLongitude}&saddr=${sLatitude},${sLongitude}`;
      break;
    }
    case 'comgooglemaps':
    case 'geo': {
      url = lookForGasStation
        ? 'https://www.google.com/maps/search/Gas+stations'
        : `https://www.google.com/maps/dir/?api=1&center=${sLatitude},${sLongitude}&origin=${sLatitude},${sLongitude}&destination=${dLatitude},${dLongitude}&travelmode=driving&dir_action=navigate`;
      break;
    }
    case 'waze': {
      url = lookForGasStation
        ? 'https://waze.com/ul?q=Gas+stations'
        : `https://waze.com/ul?ll=${dLatitude},${dLongitude}&navigate=yes`;
      break;
    }
  }

  Linking.openURL(url).catch(() => {
    Alert({
      title: I18n.t('general:alert.appInstalled.title'),
      message: I18n.t('general:alert.appInstalled.message', { type }),
      buttons: [
        {
          text: I18n.t('general:ok'),
          style: 'cancel'
        }
      ]
    });
  });
};

export { configuration, navigateInSheet };
