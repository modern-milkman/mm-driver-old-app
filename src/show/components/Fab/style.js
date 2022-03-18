import { StyleSheet } from 'react-native';

export default ({ colors }) =>
  StyleSheet.create({
    fabCurrentLocation: {
      position: 'absolute',
      backgroundColor: colors.white,
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.inputSecondary,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 3
    }
  });
