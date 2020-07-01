import AsyncStorage from '@react-native-community/async-storage';

export const storeConfig = {
  key: 'mm-driver-persist',
  storage: AsyncStorage,
  timeout: null,
  blacklist: ['actionsheetandroid'],
  transforms: []
};

export default { storeConfig };
