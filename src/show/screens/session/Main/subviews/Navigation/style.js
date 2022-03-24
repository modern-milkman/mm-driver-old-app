import { StyleSheet } from 'react-native';

export default ({ colors }) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutral,
      width: '100%'
    },
    flex1: {
      flex: 1
    }
  });
