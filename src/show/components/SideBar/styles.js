import { StyleSheet } from 'react-native';

import { colors } from 'Theme';

// branding
const styles = StyleSheet.create({
  sideBarWrapper: {
    zIndex: 999,
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flex: 1
  },
  content: {
    backgroundColor: 'white',
    height: '100%',
    width: 310,
    position: 'absolute',
    zIndex: 998
  },
  closeArea: {
    backgroundColor: '#000',
    opacity: 0.5,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 997
  },
  fullView: {
    width: '100%',
    height: '100%'
  },
  profilePicture: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 10
  }
});

export default styles;
