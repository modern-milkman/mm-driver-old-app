import axios from 'axios';
import Config from 'react-native-config';

import store from 'Redux/store';
import { timeToHMArray } from 'Helpers';
import repositories from 'Repositories';
import NavigationService from 'Navigation/service';
import Analytics, { EVENTS } from 'Services/analytics';
import { Creators as UserActions } from 'Reducers/user';
import { Creators as DeviceActions } from 'Reducers/device';
import { Creators as ApplicationActions } from 'Reducers/application';

let TOKEN = null;
let REFRESH_TOKEN = null;

const defaultConfig = {
  internal: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-version': Config.X_API_VERSION
  }
};

const api = axios.create({
  baseURL: `${Config.SERVER_URL}${Config.SERVER_URL_BASE}`,
  timeout: parseInt(Config.API_TIMEOUT)
});

const interceptors = {
  config: (config) => {
    if (TOKEN && config.internal) {
      config.headers.Authorization = 'Bearer ' + TOKEN;
    }
    return config;
  },
  responseSuccess: (response) => response,
  responseError: async (error) => {
    const originalRequest = error.config;
    const { dispatch, getState } = store().store;
    const { user } = getState();
    if (error?.response?.status === 401) {
      if (originalRequest.url.includes('/Security/Refresh')) {
        dispatch(ApplicationActions.logout());
        return Promise.reject(error);
      } else {
        if (new Date(user.refreshExpiry) < new Date()) {
          dispatch(ApplicationActions.logout());
          return Promise.reject(error);
        } else {
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
        }
      }
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

  testCustomHeaders({ headers }) {
    if (headers) {
      if (
        headers['x-app-version'] &&
        headers['x-app-version'] > Config.APP_VERSION_NAME
      ) {
        NavigationService.navigate({
          routeName: 'UpgradeApp',
          params: { minimumVersion: headers['x-app-version'] }
        });
      }
      if (headers['x-route-time']) {
        const { dispatch } = store().store;
        const [h, m] = timeToHMArray(headers['x-route-time']);
        dispatch(
          DeviceActions.updateProps({ resetHourDay: h * 60 * 60 + m * 60 })
        );
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

  get(path, config = defaultConfig) {
    const request = api.get(path, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError);
    return request;
  },

  post(path, body, config = defaultConfig) {
    const request = api.post(path, body, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError);
    return request;
  },

  put(path, body, config = defaultConfig) {
    const request = api.put(path, body, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError);
    return request;
  },

  patch(path, body, config = defaultConfig) {
    const request = api.patch(path, body, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError);
    return request;
  },

  delete(path, config = defaultConfig) {
    const request = api.delete(path, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError);
    return request;
  }
};

export default Api;
