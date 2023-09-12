import Api from 'Api';

export default {
  acceptTerms: () => {
    return Api.post(`${Api.DELIVERY_URL()}/Delivery/AcceptedTermsVersion`);
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
  },

  getDriver: () => {
    return Api.get('/Driver');
  }
};
