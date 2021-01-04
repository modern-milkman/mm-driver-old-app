import Api from 'Api';
import Config from 'react-native-config';

export default {
  getLatest() {
    return Api.get(
      `https://api.appcenter.ms/v0.1/public/sdk/apps/${Config.APPCENTER_ANDROID_APP_SECRET}/distribution_groups/${Config.APPCENTER_ANDROID_DISTRIBUTION_GID}/releases/latest`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
