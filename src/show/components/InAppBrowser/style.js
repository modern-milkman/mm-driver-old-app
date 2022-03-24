import { StyleSheet } from 'react-native';

const flex = {
  flex: 1
};

export default ({ colors }) =>
  StyleSheet.create({
    inappwrapper: {
      ...flex,
      backgroundColor: colors.primary
    }
  });
