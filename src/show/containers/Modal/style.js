import { StyleSheet } from 'react-native';

const flex = {
  flex: 1
};

export default ({ alphaColor }) =>
  StyleSheet.create({
    sawrapper: {
      ...flex,
      width: '100%',
      height: '100%',
      backgroundColor: alphaColor('blackOnly', 0.85)
    },
    flex: {
      ...flex
    }
  });
