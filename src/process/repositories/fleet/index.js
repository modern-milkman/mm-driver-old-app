import Api from 'Api';
import Config from 'react-native-config';

export default {
  drivers(params) {
    return Api.post(`${Config.FLEET_TRACKER_URL}/drivers`, {
      ...params
    });
  }
};
