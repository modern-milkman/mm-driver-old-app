import { StyleSheet } from 'react-native';

import { colors, shadows } from 'Theme';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 3,
    backgroundColor: colors.neutral,
    width: '100%',
    ...shadows.hintHigher
  }
});

export default styles;
