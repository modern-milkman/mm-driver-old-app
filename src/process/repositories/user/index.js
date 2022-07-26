import Api from 'Api';

export default {
  login: (email, password) => {
    return Api.post(`${Api.SS_URL_SUFFIX('admin')}/Security/Logon`, {
      username: email, // API expects username to be email
      password
    });
  },

  refreshToken: (jwtToken, refreshToken) => {
    return Api.post(`${Api.SS_URL_SUFFIX('admin')}/Security/Refresh`, {
      jwtToken,
      refreshToken
    });
  },

  getDriver: () => {
    return Api.get(`${Api.SS_URL_SUFFIX('admin')}/Driver`);
  }
};
