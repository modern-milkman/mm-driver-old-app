import I18n from '/process/locales/I18n';

export const validations = {
  email: {
    isValid: (value) => {
      const emailRegex = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ //eslint-disable-line
      );
      return (
        value === null ||
        value === undefined ||
        value.length === 0 ||
        emailRegex.test(value.toLowerCase())
      );
    },
    message: I18n.t('validations:invalid.email')
  }
};
