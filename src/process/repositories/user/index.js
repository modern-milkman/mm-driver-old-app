import Api from '/process/api';

export default {
  login(email, password) {
    return Api.post('/Security/Logon', {
      username: email, // API expects username to be email
      password
    });
  }
};
