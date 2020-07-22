import { StyleSheet } from 'react-native';

import { shadows } from 'Theme';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 2,

    width: '100%',
    minHeight: 150,
    backgroundColor: '#FFF',

    ...shadows.hint
  }
});

export default styles;
