import { AppRegistry } from 'react-native';
import Application from '/show/Application';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => Application);

//eslint-disable-next-line
console.disableYellowBox = true;
