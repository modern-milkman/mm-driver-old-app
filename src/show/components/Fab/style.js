import { StyleSheet } from 'react-native';
import { colors } from 'Theme';

const style = StyleSheet.create({
  fabCurrentLocation: {
    position: 'absolute',
    backgroundColor: colors.standard,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  }
});

export default style;
