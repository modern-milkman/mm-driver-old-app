import { StyleSheet } from 'react-native';

import { colors, shadows } from 'Theme';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 2,
    width: '100%',
    minHeight: 150,
    backgroundColor: colors.neutral,
    ...shadows.hintLower
  }
});

export default styles;
