export const alphaColor = (color = 'primary', opacity = '1') =>
  `rgba(${rgbColors[color]},${opacity})`;

const rgbColors = {
  error: '253, 77, 79', //#FD4D4F,
  input: '221, 236, 239', //#DDECEF
  inputDark: '169, 177, 187', //#A9B1BB
  neutral: '248, 249, 253', //#F8F9FD
  primary: '80, 195, 213', //'#50C3D5'
  primaryBright: '64, 169, 254', //#40A9FE
  primaryLight: '169, 225, 233', //#A9E1E9
  secondary: '20, 16, 87', //'#141057'
  secondaryDark: '7, 5, 48', //'#070530'
  secondaryLight: '137, 134, 171', //'#8986AB'
  success: '115, 208, 61', //#73D03D
  warning: '255, 169, 64', //#FFA940
  white: '255, 255, 255' //#FFFFFF
};

export const colors = {
  error: `rgb(${rgbColors.error})`,
  input: `rgb(${rgbColors.input})`,
  inputDark: `rgb(${rgbColors.inputDark})`,
  neutral: `rgb(${rgbColors.neutral})`,
  primary: `rgb(${rgbColors.primary})`,
  primaryBright: `rgb(${rgbColors.primaryBright})`,
  primaryLight: `rgb(${rgbColors.primaryLight})`,
  secondary: `rgb(${rgbColors.secondary})`,
  secondaryDark: `rgb(${rgbColors.secondaryDark})`,
  secondaryLight: `rgb(${rgbColors.secondaryLight})`,
  success: `rgb(${rgbColors.success})`,
  warning: `rgb(${rgbColors.warning})`,
  white: `rgb(${rgbColors.white})`
};
