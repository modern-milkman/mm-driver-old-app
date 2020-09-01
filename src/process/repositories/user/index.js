import Api from 'Api';

export default {
  getId: () => {
    return Api.get('/Security/GetId');
  },

  login: (email, password) => {
    return Api.post('/Security/Logon', {
      username: email, // API expects username to be email
      password
    });
  },

  refreshToken: (jwtToken, refreshToken) => {
    return Api.post('/Security/Refresh', {
      jwtToken,
      refreshToken
    });
  }
};
