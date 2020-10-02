export const alphaColor = (color = 'primary', opacity = '1') =>
  `rgba(${rgbColors[color]},${opacity})`;

const rgbColors = {
  error: '218, 55, 73', //#DA3749,
  input: '221, 236, 239', //#DDECEF
  inputDark: '169, 177, 187', //#A9B1BB
  neutral: '248, 249, 253', //#F8F9FD
  primary: '80, 195, 213', //'#50C3D5'
  primaryDark: '47, 151, 167', //#2F97A7
  primaryLight: '169, 225, 233', //#A9E1E9
  secondary: '20, 16, 87', //'#141057'
  secondaryDark: '7, 5, 48', //'#070530'
  secondaryLight: '137, 134, 171', //'#8986AB'
  success: '113, 231, 195', //#71E7C3
  warning: '253, 178, 54', //#FDB236
  white: '255, 255, 255' //#FFFFFF
};

export const colors = {
  error: `rgb(${rgbColors.error})`,
  input: `rgb(${rgbColors.input})`,
  inputDark: `rgb(${rgbColors.inputDark})`,
  neutral: `rgb(${rgbColors.neutral})`,
  primary: `rgb(${rgbColors.primary})`,
  primaryDark: `rgb(${rgbColors.primaryDark})`,
  primaryLight: `rgb(${rgbColors.primaryLight})`,
  secondary: `rgb(${rgbColors.secondary})`,
  secondaryDark: `rgb(${rgbColors.secondaryDark})`,
  secondaryLight: `rgb(${rgbColors.secondaryLight})`,
  success: `rgb(${rgbColors.success})`,
  warning: `rgb(${rgbColors.warning})`,
  white: `rgb(${rgbColors.white})`
};
