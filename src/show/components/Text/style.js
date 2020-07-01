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
  [Types.CAPTION]: {
    textStyle: {
      marginTop: 7,
      marginBottom: 7,
      marginLeft: 15,
      marginRight: 15,
      paddingVertical: 12
    }
  },
  [Types.CALLOUT]: {
    textStyle: {
      marginTop: 7,
      marginBottom: 7,
      marginLeft: 15,
      marginRight: 15,
      paddingVertical: 5,
      ...systemWeights.semibold
    }
  },
  [Types.SUBHEAD]: {
    textStyle: {
      paddingVertical: 15,
      marginLeft: 15,
      marginRight: 15
    }
  },
  [Types.FOOTNOTE]: {
    textStyle: {
      marginLeft: 15,
      marginRight: 15,
      textTransform: 'uppercase',
      ...systemWeights.semibold
    }
  },
  [Types.TITLE]: {
    textStyle: {
      marginLeft: 15,
      marginRight: 15,
      ...systemWeights.bold
    }
  },
  flex: {
    flex: 1
  },
  noMargins: {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0
  },
  noMarginLeft: {
    marginLeft: 0
  },
  noMarginVertical: {
    marginTop: 0,
    marginBottom: 0
  },
  noPaddings: {
    paddingVertical: 0
  }
};
