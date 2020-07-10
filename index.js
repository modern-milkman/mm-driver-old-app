import { enableES5 } from 'immer';
import { AppRegistry } from 'react-native';

import Application from './src/show/Application';
import { name as appName } from './package.json';

enableES5();

AppRegistry.registerComponent(appName, () => Application);

//eslint-disable-next-line
console.disableYellowBox = true;
