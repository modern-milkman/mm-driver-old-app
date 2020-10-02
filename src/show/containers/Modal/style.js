import { defaults } from 'Theme';

const flex = {
  flex: 1
};

export default {
  sawrapper: {
    ...flex,
    width: '100%',
    height: '100%',
    backgroundColor: defaults.overlayBackground
  },
  flex: {
    ...flex
  }
};
