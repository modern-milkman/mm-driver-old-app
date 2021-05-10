import RNFS from 'react-native-fs';
import Config from 'react-native-config';

import Api from 'Api';

export default {
  clear: async () => {
    const clearFolders = [
      Config.FS_CUSTOMER_IMAGES,
      Config.FS_DRIVER_REPLY_IMAGES
    ];
    for (const path of clearFolders) {
      await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${path}`);
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/${path}`);
    }
  },

  downloadFile: (params) => {
    // returns  { jobId, promise } obj if needed
    RNFS.downloadFile({
      ...params,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': Config.X_API_VERSION,
        Authorization: 'Bearer ' + Api.getToken()
      }
    });
  },

  init: async () => {
    const createIfNotExists = [
      Config.FS_PROD_IMAGES,
      Config.FS_CUSTOMER_IMAGES,
      Config.FS_DRIVER_REPLY_IMAGES
    ];
    for (const path of createIfNotExists) {
      if (!(await RNFS.exists(`${RNFS.DocumentDirectoryPath}/${path}`))) {
        await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/${path}`);
      }
    }

    return true;
  }
};
