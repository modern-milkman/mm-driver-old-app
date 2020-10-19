import axios from 'axios';
import Config from 'react-native-config';

import store from 'Redux/store';
import repositories from 'Repositories';
import NavigationService from 'Navigation/service';
import Analytics, { EVENTS } from 'Services/analytics';
import { Creators as UserActions } from 'Reducers/user';
import { Creators as ApplicationActions } from 'Reducers/application';

let TOKEN = null;
let REFRESH_TOKEN = null;

const api = axios.create({
  baseURL: `${Config.SERVER_URL}${Config.SERVER_URL_BASE}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-version': Config.X_API_VERSION
  },
  timeout: parseInt(Config.API_TIMEOUT)
});

const interceptors = {
  config: (config) => {
    if (TOKEN) {
      config.headers.Authorization = 'Bearer ' + TOKEN;
    }
    return config;
  },
  responseSuccess: (response) => response,
  responseError: async (error) => {
    const originalRequest = error.config;
    const { dispatch } = store().store;
    if (error?.response?.status === 401) {
      if (!originalRequest.url.includes('/Security/Refresh')) {
        const refreshResponse = await repositories.user.refreshToken(
          Api.getToken(),
          Api.getRefreshToken()
        );

        Api.setToken(
          refreshResponse.data.jwtToken,
          refreshResponse.data.refreshToken
        );

        dispatch(UserActions.updateProps({ ...refreshResponse.data }));

        return api(originalRequest);
      } else {
        dispatch(ApplicationActions.logout());
      }
    } else if (originalRequest.url.includes('/Security/Refresh')) {
      // refresh token failed for other reasons
      dispatch(ApplicationActions.logout());
    }

    return Promise.reject(error);
  }
};

api.interceptors.request.use(interceptors.config);

api.interceptors.response.use(
  interceptors.responseSuccess,
  interceptors.responseError
);

const Api = {
  API_CALL: 'API_CALL',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',

  repositories,

  async setToken(jwtToken = null, refreshToken = null) {
    if (jwtToken) {
      TOKEN = jwtToken;
    } else {
      TOKEN = null;
    }
    if (refreshToken) {
      REFRESH_TOKEN = refreshToken;
    } else {
      REFRESH_TOKEN = null;
    }
  },

  testMinVersion({ headers }) {
    if (headers && headers['x-app-version']) {
      if (headers['x-app-version'] > Config.APP_VERSION_NAME) {
        NavigationService.navigate({
          routeName: 'UpgradeApp',
          params: { minimumVersion: headers['x-app-version'] }
        });
      }
    }
  },

  getToken() {
    return TOKEN;
  },

  getRefreshToken() {
    return REFRESH_TOKEN;
  },

  catchError(error) {
    Analytics.trackEvent(EVENTS.API_ERROR, {
      error
    });
  },

  get(path) {
    const request = api.get(path);
    request.then(this.testMinVersion);
    request.catch(Api.catchError);
    return request;
  },

  post(path, body) {
    const request = api.post(path, body);
    request.then(this.testMinVersion);
    request.catch(Api.catchError);
    return request;
  },

  put(path, body) {
    const request = api.put(path, body);
    request.then(this.testMinVersion);
    request.catch(Api.catchError);
    return request;
  },

  patch(path, body) {
    const request = api.patch(path, body);
    request.then(this.testMinVersion);
    request.catch(Api.catchError);
    return request;
  },

  delete(path) {
    const request = api.delete(path);
    request.then(this.testMinVersion);
    request.catch(Api.catchError);
    return request;
  }
};

export default Api;
