import Api from 'Api';

export default {
  login(email, password) {
    return Api.post('/Security/Logon', {
      username: email, // API expects username to be email
      password
    });
  },

  refreshToken(jwtToken, refreshToken) {
    return Api.post('/Security/Refresh', {
      jwtToken,
      refreshToken
    });
  }
};
