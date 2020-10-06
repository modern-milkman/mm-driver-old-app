import axios from 'axios';
import Config from 'react-native-config';

import repositories from 'Repositories';
import Analytics, { EVENTS } from 'Services/analytics';

let TOKEN = null;

const api = axios.create({
  baseURL: `${Config.SERVER_URL}${Config.SERVER_URL_BASE}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-version': Config.X_API_VERSION
  },
  timeout: parseInt(Config.API_TIMEOUT)
});

api.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers.Authorization = 'Bearer ' + TOKEN;
  }
  return config;
});

const Api = {
  API_CALL: 'API_CALL',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',

  repositories,

  async setToken(value = null) {
    if (value) {
      TOKEN = value;
    } else {
      TOKEN = null;
    }
  },

  getToken() {
    return TOKEN;
  },

  catchError(error) {
    Analytics.trackEvent(EVENTS.API_ERROR, {
      error
    });
  },

  get(path) {
    const request = api.get(path);
    request.catch(Api.catchError);
    return request;
  },

  post(path, body) {
    const request = api.post(path, body);
    request.catch(Api.catchError);
    return request;
  },

  put(path, body) {
    const request = api.put(path, body);
    request.catch(Api.catchError);
    return request;
  },

  patch(path, body) {
    const request = api.patch(path, body);
    request.catch(Api.catchError);
    return request;
  },

  delete(path) {
    const request = api.delete(path);
    request.catch(Api.catchError);
    return request;
  }
};

export default Api;
