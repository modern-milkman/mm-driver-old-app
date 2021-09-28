import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBlacklistFilter } from 'redux-persist-transform-filter';

export const storeConfig = {
  key: 'mm-driver-persist',
  storage: AsyncStorage,
  timeout: null,
  blacklist: ['actionsheetandroid'],
  transforms: [
    createBlacklistFilter('application', [
      'processing',
      'sideBarOpen',
      'mounted'
    ])
  ]
};

export default { storeConfig };
