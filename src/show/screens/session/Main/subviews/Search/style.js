import { StyleSheet } from 'react-native';

export default ({ colors }) =>
  StyleSheet.create({
    container: {
      left: 0,
      top: 0,
      position: 'absolute',
      width: '100%',
      zIndex: 2
    },
    listWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 7
    },
    safeArea: {
      top: 0,
      height: '100%'
    },
    animatedList: {
      backgroundColor: colors.neutral,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 8,
      elevation: 8
    },
    elevation7: { elevation: 7 }
  });
