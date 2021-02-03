import I18n from 'Locales/I18n';

export default {
  email: {
    isValid: (value) => {
      const emailRegex = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ //eslint-disable-line no-useless-escape
      );
      return (
        value === null ||
        value === undefined ||
        value.length === 0 ||
        emailRegex.test(value.toLowerCase())
      );
    },
    message: I18n.t('validations:invalid.email')
  },
  currentMileage: {
    isValid: (value) => {
      const numberRegex = new RegExp(/^[1-9][0-9]*$/);
      return (
        value === null ||
        value === undefined ||
        value.length === 0 ||
        numberRegex.test(value)
      );
    },
    message: I18n.t('validations:invalid.currentMileage')
  }
};
