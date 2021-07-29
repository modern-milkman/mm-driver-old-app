import { enableES5 } from 'immer';
import Crashes from 'appcenter-crashes';
import Config from 'react-native-config';
import { AppRegistry } from 'react-native';
import Analytics from 'appcenter-analytics';

import Application from './src/show/Application';
import { name as appName } from './package.json';

enableES5();

if (global.location && global.location.pathname.includes('/debugger-ui')) {
  // for rn-debugger
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
}

if (Config.ENVIRONMENT === 'development') {
  Crashes.setEnabled(false);
  Analytics.setEnabled(false);
} else if (['test', 'uat'].includes(Config.ENVIRONMENT)) {
  Analytics.setEnabled(false);
}

AppRegistry.registerComponent(appName, () => Application);

// eslint-disable-next-line no-console
console.disableYellowBox = true;
