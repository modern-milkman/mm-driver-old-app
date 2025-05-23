import I18n from 'Locales/I18n';

const numericValidation = {
  isValid: value => {
    const numberRegex = new RegExp(/^0$|^[1-9][0-9]*$/);
    return (
      value === null ||
      value === undefined ||
      value.length === 0 ||
      numberRegex.test(value)
    );
  },
  message: I18n.t('validations:invalid.numericValidation')
};

const requiredValidation = {
  isValid: value => {
    return !(
      value === null ||
      value === undefined ||
      value.length === 0 ||
      value.trim().length === 0
    );
  },
  message: I18n.t('validations:invalid.requiredValidation')
};

const textValidation = {
  isValid: value => {
    if (value === null || value === undefined) {
      return true;
    }
    return value.length === 0 || value?.trim().length > 0;
  },
  message: I18n.t('validations:invalid.textValidation')
};

export const regex = {
  empties: {
    tester: new RegExp(/^empty[0-9]+$/),
    validations: [numericValidation]
  },
  requiredEmpties: {
    tester: new RegExp(/^requiredEmpty[0-9]+$/),
    validations: [requiredValidation, numericValidation]
  }
};

export const standard = {
  currentMileage: [requiredValidation, numericValidation],
  email: [
    {
      isValid: value => {
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
    }
  ],
  vehicleRegistration: [requiredValidation],
  text: [textValidation]
};
