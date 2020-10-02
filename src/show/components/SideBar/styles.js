import { StyleSheet } from 'react-native';

import { colors, defaults } from 'Theme';

const fullView = {
  width: '100%',
  height: '100%'
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.neutral,
    height: '100%',
    position: 'absolute',
    zIndex: 3
  },
  closeArea: {
    ...fullView,
    backgroundColor: defaults.overlayBackground,
    position: 'absolute',
    zIndex: 2
  },
  fullView: fullView,
  sideBarWrapper: {
    flex: 1,
    ...fullView,
    position: 'absolute',
    zIndex: 1
  }
});

export default styles;
