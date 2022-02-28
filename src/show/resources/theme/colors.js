export const alphaColor = (color = 'primary', opacity = '1') =>
  `rgba(${rgbColors[color]},${opacity})`;

const rgbColors = {
  error: '252, 138, 131', //#FC8A83,
  input: '221, 236, 239', //#DDECEF
  inputDark: '54, 83, 105', //'#365369'
  neutral: '248, 249, 253', //#F8F9FD
  primary: '3, 122, 148', //'#B6DCE1'
  secondary: '54, 83, 105', //'#365369'
  secondaryDark: '7, 5, 48', //'#070530'
  secondaryLight: '137, 134, 171', //'#8986AB'
  success: '115, 208, 61', //#73D03D
  warning: '240, 189, 151', //#F0DF97
  white: '255, 255, 255' //#FFFFFF
};

export const colors = {
  error: `rgb(${rgbColors.error})`,
  input: `rgb(${rgbColors.input})`,
  inputDark: `rgb(${rgbColors.inputDark})`,
  neutral: `rgb(${rgbColors.neutral})`,
  primary: `rgb(${rgbColors.primary})`,
  secondary: `rgb(${rgbColors.secondary})`,
  secondaryDark: `rgb(${rgbColors.secondaryDark})`,
  secondaryLight: `rgb(${rgbColors.secondaryLight})`,
  success: `rgb(${rgbColors.success})`,
  warning: `rgb(${rgbColors.warning})`,
  white: `rgb(${rgbColors.white})`
};
