import axios from 'axios';
import EM from 'es-event-emitter';
import Config from 'react-native-config';
import { coerce, gt as semverGt } from 'semver';
import NetInfo from '@react-native-community/netinfo';

import I18n from 'Locales/I18n';
import store from 'Redux/store';
import repositories from 'Repositories';
import NavigationService from 'Services/navigation';
import Analytics, { EVENTS } from 'Services/analytics';
import { Creators as UserActions } from 'Reducers/user';
import EncryptedStorage from 'Services/encryptedStorage';
import { Creators as GrowlActions } from 'Reducers/growl';
import { Creators as DeviceActions } from 'Reducers/device';
import * as LocalAuthentication from 'expo-local-authentication';
import { Creators as ApplicationActions } from 'Reducers/application';
import { blacklists, timeoutResponseStatuses, timeToHMArray } from 'Helpers';

import countryBasedEnvironmentConfig from './countryBasedEnvironmentConfig.json';

let TOKEN = null;
let REFRESH_TOKEN = null;
let NETINFO_LISTENER = null;
const requestCountTimes = [];

// COUNTRY BASED CONFIG
const COUNTRY_BASED_PROP = (rootProp, secondaryProp = null) => {
  const country =
    store().store.getState().device.country || Config.DEFAULT_COUNTRY;
  if (secondaryProp) {
    return countryBasedEnvironmentConfig[Config.ENVIRONMENT][rootProp][
      secondaryProp
    ][country];
  }
  return countryBasedEnvironmentConfig[Config.ENVIRONMENT][rootProp][country];
};

const configureCountryBaseURL = () => {
  api.defaults.baseURL = `${COUNTRY_BASED_PROP('ADMIN')}`;

  if (NETINFO_LISTENER) {
    NETINFO_LISTENER();
  }
  NetInfo.configure({
    reachabilityUrl: api.defaults.baseURL + Config.NETINFO_REACHABILITY_URL,
    reachabilityLongTimeout: parseInt(Config.NETINFO_REACHABILITY_LONG_TIMEOUT),
    reachabilityShortTimeout: parseInt(
      Config.NETINFO_REACHABILITY_SHORT_TIMEOUT
    ),
    reachabilityRequestTimeout: parseInt(
      Config.NETINFO_REACHABILITY_REQUEST_TIMEOUT
    ),
    reachabilityTest: async response => response.status === 200,
    reachabilityMethod: 'GET',
    reachabilityHeaders: { 'x-api-version': Config.X_API_VERSION }
  });
  NETINFO_LISTENER = NetInfo.addEventListener(handleNetStatChange);
  NetInfo.fetch().then(handleNetStatChange);
};

const RMR_COUNTRY_BASED_PROP = () => {
  const user = store().store.getState().user;
  const routeDescription =
    store().store.getState().delivery.stockWithData.routeDescription;

  return `${COUNTRY_BASED_PROP('RATE_MY_ROUND')}&entry.2020812711=${
    user.name
  }&entry.1414591438=${user.driverId}&entry.1516670531=${routeDescription}`;
};

const handleNetStatChange = netStatProps => {
  const { dispatch } = store().store;
  dispatch({ type: 'REDUX_SAGA_NETSTAT_CHANGE', netStatProps });
};

// API
const api = axios.create({
  timeout: parseInt(Config.API_TIMEOUT)
});

const defaultConfig = {
  internal: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-version': Config.X_API_VERSION,
    'x-app-version': Config.APP_VERSION_NAME
  }
};

const handleRequestsQueue = (
  error,
  { body = null, config = null, path = null }
) => {
  if (
    !config?.queued &&
    error.config.method !== 'get' &&
    !blacklists.apiEndpointOfflineTracking.includes(
      `${error.config.baseURL}${error.config.url}`
    ) &&
    !blacklists.apiEndpointOfflineTracking.includes(error.config.url)
  ) {
    const { dispatch, getState } = store().store;
    const { user } = getState();

    dispatch(
      DeviceActions.pushRequest(
        timeoutResponseStatuses.includes(error.response.status)
          ? 'offline'
          : 'failed',
        {
          body,
          config,
          driverId: user.driverId,
          method: error.config.method,
          path,
          status: error.response.status
        }
      )
    );
  }
};

const trackInAmplitude = error => {
  if (
    !blacklists.apiEndpointFailureTracking.includes(
      `${error.config.baseURL}${error.config.url}`
    ) &&
    !blacklists.apiEndpointFailureTracking.includes(error.config.url)
  ) {
    Analytics.trackEvent(EVENTS.API_ERROR, {
      error
    });
  }
};

const refreshSession = {
  bus: new EM(),
  lock: false,
  timeout: null
};

// API INTERCEPTORS
const interceptors = {
  config: config => {
    config.meta = config.meta || {};
    config.meta.requestStartedAt = new Date().getTime();

    if (TOKEN && config.internal) {
      config.headers.Authorization = 'Bearer ' + TOKEN;
    }
    return config;
  },
  responseSuccess: response => {
    const { dispatch, getState } = store().store;
    const {
      application: { userSessionPresent },
      device
    } = getState();
    const {
      processors: { syncData },
      requestQueues: { offline }
    } = device;

    if (device.network.status !== 0) {
      dispatch(DeviceActions.updateNetworkProps({ status: 0 }));
    }

    if (userSessionPresent && !syncData && offline.length > 0) {
      dispatch(
        GrowlActions.alert({
          type: 'info',
          title: I18n.t('alert:success.network.online.title'),
          message: I18n.t('alert:success.network.online.message')
        })
      );

      dispatch(DeviceActions.syncOffline());
    }

    interceptors.getRequestTime(response);
    return response;
  },
  responseError: async error => {
    const originalRequest = error.config;
    const { dispatch, getState } = store().store;
    const { user, device } = getState();

    if (!error.response) {
      error.response = {
        statusText: error.message,
        status: 'TIMEOUT'
      };
    }

    const bypassLogout =
      (device.network.status === 1 &&
        device.requestQueues.offline.length > 0) ||
      device.network.status === 2;

    if (
      !blacklists.apiEndpointFailureTracking.includes(
        `${error.config.baseURL}${error.config.url}`
      ) &&
      !blacklists.apiEndpointFailureTracking.includes(error.config.url)
    ) {
      if (
        device.network.status === 0 &&
        timeoutResponseStatuses.includes(error.response.status)
      ) {
        dispatch(DeviceActions.updateNetworkProps({ status: 1 }));
      }
      interceptors.getRequestTime(error);
    }

    if (error.response.status === 401) {
      if (
        originalRequest.url.includes('/Security/Logon') ||
        originalRequest.url.includes('/Security/Refresh')
      ) {
        return Promise.reject(error);
      } else {
        if (new Date(user.refreshExpiry) < new Date()) {
          if (refreshSession.lock) {
            await new Promise(resolve =>
              refreshSession.bus.once('unlocked', resolve)
            );
          } else {
            refreshSession.lock = true;

            const { biometrics, rememberMe } = device;
            if (biometrics.active && rememberMe) {
              const credentials = await EncryptedStorage.get('userCredentials');
              const biometricAuth =
                await LocalAuthentication.authenticateAsync();
              if (biometricAuth.success && credentials) {
                const { email, password } = credentials;

                refreshSession.timeout = setTimeout(() => {
                  refreshSession.lock = false;
                  refreshSession.bus.emit('unlocked');
                }, parseInt(Config.API_TIMEOUT));

                try {
                  const refreshResponse = await repositories.user.login(
                    email,
                    password
                  );
                  clearTimeout(refreshSession.timeout);

                  Api.setToken(
                    refreshResponse.data.jwtToken,
                    refreshResponse.data.refreshToken
                  );

                  dispatch(
                    UserActions.updateProps({ ...refreshResponse.data })
                  );
                  refreshSession.lock = false;
                  refreshSession.bus.emit('unlocked');
                } catch (e) {
                  clearTimeout(refreshSession.timeout);
                  if (!bypassLogout) {
                    dispatch(ApplicationActions.logout());
                  }
                  refreshSession.lock = false;
                  refreshSession.bus.emit('unlocked');

                  return Promise.reject(error);
                }
              } else {
                refreshSession.lock = false;
                if (!bypassLogout) {
                  dispatch(ApplicationActions.logout());
                }
                return Promise.reject(error);
              }
            } else {
              refreshSession.lock = false;
              if (!bypassLogout) {
                dispatch(ApplicationActions.logout());
              }
              return Promise.reject(error);
            }
          }

          return api(originalRequest);
        } else {
          if (refreshSession.lock) {
            await new Promise(resolve =>
              refreshSession.bus.once('unlocked', resolve)
            );
          } else if (Api.getToken() && Api.getRefreshToken()) {
            refreshSession.lock = true;

            refreshSession.timeout = setTimeout(() => {
              refreshSession.lock = false;
              refreshSession.bus.emit('unlocked');
            }, parseInt(Config.API_TIMEOUT));

            try {
              const refreshResponse = await repositories.user.refreshToken(
                Api.getToken(),
                Api.getRefreshToken()
              );

              clearTimeout(refreshSession.timeout);

              Api.setToken(
                refreshResponse.data.jwtToken,
                refreshResponse.data.refreshToken
              );

              dispatch(UserActions.updateProps({ ...refreshResponse.data }));

              refreshSession.lock = false;
              refreshSession.bus.emit('unlocked');
            } catch (e) {
              clearTimeout(refreshSession.timeout);
              if (!bypassLogout) {
                dispatch(ApplicationActions.logout());
              }
              refreshSession.lock = false;
              refreshSession.bus.emit('unlocked');
              return Promise.reject(error);
            }
          } else {
            if (!bypassLogout) {
              dispatch(ApplicationActions.logout());
            }
            return Promise.reject(error);
          }

          return api(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  },
  getRequestTime: response => {
    const time = new Date().getTime() - response.config.meta.requestStartedAt;
    Api.executionTimingmeanRequestTime(time);
  }
};

api.interceptors.request.use(interceptors.config);

api.interceptors.response.use(
  interceptors.responseSuccess,
  interceptors.responseError
);

const Api = {
  API_CALL: 'API_CALL',
  RATE_MY_ROUND: RMR_COUNTRY_BASED_PROP,
  ADMIN_URL: COUNTRY_BASED_PROP.bind(null, 'ADMIN'),
  DELIVERY_URL: COUNTRY_BASED_PROP.bind(null, 'DELIVERY'),
  OPERATIONS_URL: COUNTRY_BASED_PROP.bind(null, 'OPERATIONS'),

  configureCountryBaseURL,
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

  executionTimingmeanRequestTime(lastReqTime) {
    const { dispatch, getState } = store().store;
    const {
      device: { lowConnection }
    } = getState();

    if (requestCountTimes.length >= parseInt(Config.REQUEST_COUNT_LIMIT)) {
      requestCountTimes.splice();
    }

    requestCountTimes.push(lastReqTime);

    const meanRequestTime =
      requestCountTimes.reduce((total, item) => total + item, 0) /
      requestCountTimes.length;

    if (
      (meanRequestTime > parseInt(Config.REQUEST_TIME_LIMIT) &&
        !lowConnection) ||
      (meanRequestTime <= parseInt(Config.REQUEST_TIME_LIMIT) && lowConnection)
    ) {
      dispatch(DeviceActions.lowConnectionUpdate(!lowConnection));
    }
  },

  testCustomHeaders({ headers }) {
    if (headers) {
      const { dispatch, getState } = store().store;
      let {
        user: { acceptedTermsVersion },
        application: { userSessionPresent }
      } = getState();
      if (
        headers['x-app-version'] &&
        semverGt(headers['x-app-version'], coerce(Config.APP_VERSION_NAME))
      ) {
        dispatch(
          DeviceActions.updateProps({
            minimumVersion: headers['x-app-version']
          })
        );
        NavigationService.navigate({
          routeName: 'UpgradeApp',
          params: { minimumVersion: headers['x-app-version'] }
        });
      }
      if (headers['x-route-time']) {
        const [h, m] = timeToHMArray(headers['x-route-time']);
        dispatch(
          DeviceActions.updateProps({
            resetHourDay: h * 60 * 60 + m * 60
          })
        );
      }
      if (
        userSessionPresent &&
        parseInt(headers['x-terms-version']) > acceptedTermsVersion
      ) {
        NavigationService.navigate({
          routeName: 'AcceptTerms',
          params: { minimumTermsVersion: parseInt(headers['x-terms-version']) }
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

  catchError(payload, error) {
    handleRequestsQueue(error, payload);
    trackInAmplitude(error);
  },

  get(path, config = defaultConfig) {
    const request = api.get(path, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError.bind(null, { config, path }));
    return request;
  },

  post(path, body, config = defaultConfig) {
    const request = api.post(path, body, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError.bind(null, { body, config, path }));
    return request;
  },

  put(path, body, config = defaultConfig) {
    const request = api.put(path, body, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError.bind(null, { body, config, path }));
    return request;
  },

  patch(path, body, config = defaultConfig) {
    const request = api.patch(path, body, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError.bind(null, { body, config, path }));
    return request;
  },

  delete(path, config = defaultConfig) {
    const request = api.delete(path, config);
    request.then(this.testCustomHeaders);
    request.catch(Api.catchError.bind(null, { config, path }));
    return request;
  }
};

export default Api;
