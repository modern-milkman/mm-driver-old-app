import RNFS from 'react-native-fs';
import Config from 'react-native-config';

import Api from 'Api';
import Analytics, { EVENTS } from 'Services/analytics';

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

  downloadFile: params => {
    // returns  { jobId, promise } obj if needed
    return RNFS.downloadFile({
      ...params,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': Config.X_API_VERSION,
        Authorization: 'Bearer ' + Api.getToken()
      }
    }).promise.catch(err => {
      Analytics.trackEvent(EVENTS.DOWNLOAD_FAIL, {
        errorMessage: err.message,
        params
      });
    });
  },

  init: async () => {
    const createIfNotExists = [
      Config.FS_CUSTOMER_IMAGES,
      Config.FS_DRIVER_REPLY_IMAGES,
      Config.FS_MISC,
      Config.FS_PROD_IMAGES
    ];
    for (const path of createIfNotExists) {
      if (!(await RNFS.exists(`${RNFS.DocumentDirectoryPath}/${path}`))) {
        await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/${path}`);
      }
    }

    return true;
  },

  readFile: async (filepath, encoding) => {
    return await RNFS.readFile(filepath, encoding);
  },

  writeFile: async (filepath, content, encoding) => {
    return await RNFS.writeFile(filepath, content, encoding);
  }
};
