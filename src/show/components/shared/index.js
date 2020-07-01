import shadows from './shadows';

const digitsOnly = (input) => input.replace(new RegExp(/[^0-9]/g), '');

export { digitsOnly, shadows };
