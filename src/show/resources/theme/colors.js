// Color palette
const rgbColors = {
  primary: '0, 180, 255', //'#00B4FF'
  secondary: '196, 196, 204', //'#c4c4cc'
  background: '249, 249, 249', //'#f9f9f9'
  standard: '255, 255, 255', //'#ffffff'
  accent: '48, 206, 216', //'#30ced8'
  error: '236, 60, 98', //'#ec3c62'
  warning: '255, 185, 126', //#ffb97e
  black: '0,0,0' //#000000
};

export const colors = {
  primary: `rgb(${rgbColors.primary})`,
  secondary: `rgb(${rgbColors.secondary})`,
  background: `rgb(${rgbColors.background})`,
  standard: `rgb(${rgbColors.standard})`,
  accent: `rgb(${rgbColors.accent})`,
  error: `rgb(${rgbColors.error})`,
  warning: `rgb(${rgbColors.warning})`,
  black: `rgb(${rgbColors.black})`
};

export const alphaColor = (color = 'primary', opacity = '1') =>
  `rgba(${rgbColors[color]},${opacity})`;
