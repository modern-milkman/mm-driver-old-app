import { systemWeights } from 'react-native-typography';

import Types from './Types';

/*
thin: sanFranciscoWeights.thin, // 100
light: sanFranciscoWeights.light, // 200
regular: sanFranciscoWeights.regular, // normal 400
semibold: sanFranciscoWeights.semibold, // 600
bold: sanFranciscoWeights.bold // 800
*/

export default {
  fontWeight: (weight) => ({
    ...systemWeights[weight]
  }),
  [Types.BUTTON]: {
    textStyle: {
      fontSize: 18,
      lineHeight: 60,
      letterSpacing: -0.24,
      ...systemWeights.bold
    }
  },
  [Types.CAPTION]: {
    textStyle: {
      fontSize: 11,
      lineHeight: 13,
      letterSpacing: 0.06
    }
  },
  [Types.HEADING]: {
    textStyle: {
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: 0.4,
      ...systemWeights.bold
    }
  },
  [Types.INPUT]: {
    textStyle: {
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: -0.24,
      ...systemWeights.semibold
    }
  },
  [Types.LABEL]: {
    textStyle: {
      fontSize: 12,
      lineHeight: 13,
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      ...systemWeights.semibold
    }
  },
  [Types.LIST]: {
    textStyle: {
      fontSize: 14,
      lineHeight: 16,
      letterSpacing: -0.16,
      ...systemWeights.semibold
    }
  },
  [Types.TAB]: {
    textStyle: {
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: -0.24,
      ...systemWeights.bold
    }
  },
  [Types.TAG]: {
    textStyle: {
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.2,
      ...systemWeights.semibold
    }
  },
  flex: {
    flex: 1
  }
};
