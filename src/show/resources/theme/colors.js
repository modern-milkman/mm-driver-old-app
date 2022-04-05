export const alphaColors = (theme = 'dark', color = 'primary', opacity = '1') =>
  `rgba(${RGB_COLORS[color][theme]},${opacity})`;

export const RGB_COLORS = {
  blackOnly: {
    light: '0, 0, 0', //#FFFFFF
    dark: '0, 0, 0' //#FFFFFF
  },
  error: {
    light: '252, 138, 131', //#FC8A83,
    dark: '252, 138, 131' //#FC8A83,
  },
  freddiesFlowers: {
    light: '151,125,183', // #977DB7
    dark: '151,125,183' // #977DB7
  },
  input: {
    light: '221, 236, 239', //#DDECEF
    dark: '54, 83, 105' //#365369
  },
  inputSecondary: {
    light: '54, 83, 105', //#365369
    dark: '221, 236, 239' //#DDECEF
  },
  neutral: {
    light: '248, 249, 253', //#F8F9FD
    dark: '18, 18, 18' //#121212
  },
  primary: {
    light: '3, 122, 148', //#037A94
    dark: '3, 122, 148' //#037A94
  },
  primaryBright: {
    light: '64, 169, 254', //#40A9FE
    dark: '64, 169, 254' //#40A9FE
  },
  success: {
    light: '115, 208, 61', //#73D03D
    dark: '115, 208, 61' //#73D03D
  },
  warning: {
    light: '240, 189, 151', //#F0DF97
    dark: '240, 189, 151' //#F0DF97
  },
  white: {
    light: '255, 255, 255', //#FFFFFF
    dark: '0, 0, 0' //#000000
  },
  whiteOnly: {
    light: '255, 255, 255', //#FFFFFF
    dark: '255, 255, 255' //#FFFFFF
  }
};

export const colors = theme => {
  return {
    background: `rgb(${RGB_COLORS.neutral[theme]})`,
    error: `rgb(${RGB_COLORS.error[theme]})`,
    freddiesFlowers: `rgb(${RGB_COLORS.freddiesFlowers[theme]})`,
    blackOnly: `rgb(${RGB_COLORS.blackOnly[theme]})`,
    input: `rgb(${RGB_COLORS.input[theme]})`,
    inputSecondary: `rgb(${RGB_COLORS.inputSecondary[theme]})`,
    neutral: `rgb(${RGB_COLORS.neutral[theme]})`,
    primary: `rgb(${RGB_COLORS.primary[theme]})`,
    primaryBright: `rgb(${RGB_COLORS.primaryBright[theme]})`,
    success: `rgb(${RGB_COLORS.success[theme]})`,
    warning: `rgb(${RGB_COLORS.warning[theme]})`,
    white: `rgb(${RGB_COLORS.white[theme]})`,
    whiteOnly: `rgb(${RGB_COLORS.whiteOnly[theme]})`
  };
};
