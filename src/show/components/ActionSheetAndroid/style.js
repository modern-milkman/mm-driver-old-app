import { alphaColor } from 'Theme';

const flex = {
  flex: 1
};

export default {
  sawrapper: {
    ...flex,
    backgroundColor: alphaColor('primary', 0.7)
  },
  touchToExit: {
    ...flex
  }
};
