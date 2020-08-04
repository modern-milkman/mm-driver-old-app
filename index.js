import { enableES5 } from 'immer';
import { AppRegistry } from 'react-native';

import Application from './src/show/Application';
import { name as appName } from './package.json';

enableES5();

if (global.location && global.location.pathname.includes('/debugger-ui')) {
  // for rn-debugger
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
}

AppRegistry.registerComponent(appName, () => Application);

//eslint-disable-next-line
console.disableYellowBox = true;
