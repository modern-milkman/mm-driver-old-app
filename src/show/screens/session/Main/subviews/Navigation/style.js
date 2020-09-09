import { StyleSheet } from 'react-native';

import { shadows } from 'Theme';

// branding
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 3,
    backgroundColor: 'white',
    width: '100%',

    ...shadows.hint
  }
});

export default styles;
