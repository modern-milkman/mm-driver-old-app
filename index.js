import { enableES5 } from 'immer';
import Crashes from 'appcenter-crashes';
import Config from 'react-native-config';
import Analytics from 'appcenter-analytics';
import { AppRegistry, LogBox, NativeModules } from 'react-native';

import Application from './src/show/Application';
import { name as appName } from './package.json';

enableES5();

if (__DEV__ && Platform.OS !== 'android') {
  NativeModules.DevSettings.setIsDebuggingRemotely(true);
}

if (global.location && global.location.pathname.includes('/debugger-ui')) {
  // for rn-debugger
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
}

if (Config.ENVIRONMENT === 'development') {
  Crashes.setEnabled(false);
  Analytics.setEnabled(false);
  LogBox.ignoreAllLogs();
} else if (['test', 'core'].includes(Config.ENVIRONMENT)) {
  Analytics.setEnabled(false);
}

AppRegistry.registerComponent(appName, () => Application);
