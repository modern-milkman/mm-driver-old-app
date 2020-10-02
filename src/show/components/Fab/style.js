import { StyleSheet } from 'react-native';
import { colors } from 'Theme';

const style = StyleSheet.create({
  fabCurrentLocation: {
    position: 'absolute',
    backgroundColor: colors.white,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 3,
    zIndex: 1
  }
});

export default style;
