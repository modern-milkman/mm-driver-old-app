export const alphaColors = (theme = 'dark', color = 'primary', opacity = '1') =>
  `rgba(${RGB_COLORS[color][theme]},${opacity})`;

export const RGB_COLORS = {
  blackOnly: {
    light: '0, 0, 0', //#000000
    dark: '0, 0, 0' //#000000
  },
  error: {
    light: '232, 25, 73', //#E81949,
    dark: '232, 25, 73' //#E81949,
  },
  input: {
    light: '221, 236, 239', //#DDECEF
    dark: '54, 83, 105' //#365369
  },
  inputSecondary: {
    light: '54, 83, 105', //#365369
    dark: '221, 236, 239' //#DDECEF
  },
  negative: {
    light: '0, 0, 0', //#000000
    dark: '255, 255, 255' //#FFFFFF
  },
  neutral: {
    light: '244, 244, 244', //#F4F4F4
    dark: '22, 22, 22' //#161616
  },
  primary: {
    light: '0, 127, 174', //#007FAE
    dark: '0, 127, 174' //#007FAE
  },
  primaryBright: {
    light: '92, 205, 247', //#5CCDF7
    dark: '92, 205, 247' //#5CCDF7
  },
  success: {
    light: '69, 177, 74', //#45B14A
    dark: '69, 177, 74' //#45B14A
  },
  tpl: {
    light: '151,125,183', // #977DB7
    dark: '151,125,183' // #977DB7
  },
  warning: {
    light: '255, 167, 38', //#ffa726
    dark: '255, 167, 38' //#ffa726
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
    blackOnly: `rgb(${RGB_COLORS.blackOnly[theme]})`,
    error: `rgb(${RGB_COLORS.error[theme]})`,
    input: `rgb(${RGB_COLORS.input[theme]})`,
    inputSecondary: `rgb(${RGB_COLORS.inputSecondary[theme]})`,
    negative: `rgb(${RGB_COLORS.negative[theme]})`,
    neutral: `rgb(${RGB_COLORS.neutral[theme]})`,
    primary: `rgb(${RGB_COLORS.primary[theme]})`,
    primaryBright: `rgb(${RGB_COLORS.primaryBright[theme]})`,
    success: `rgb(${RGB_COLORS.success[theme]})`,
    tpl: `rgb(${RGB_COLORS.tpl[theme]})`,
    warning: `rgb(${RGB_COLORS.warning[theme]})`,
    white: `rgb(${RGB_COLORS.white[theme]})`,
    whiteOnly: `rgb(${RGB_COLORS.whiteOnly[theme]})`
  };
};
