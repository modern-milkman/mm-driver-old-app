import { colors } from 'Theme';

export default {
  searchIconWrapper: {
    left: 8
  },
  closeIconWrapper: {
    right: 8,
    top: 0
  },
  iconWrapper: {
    position: 'absolute',
    top: 0,
    width: 45,
    height: 46,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 15,
    marginHorizontal: 8,
    paddingHorizontal: 45,
    backgroundColor: colors.standard,
    borderColor: colors.secondaryLight
  }
};
