import { StyleSheet } from 'react-native';

import { colors, defaults, sizes } from 'Theme';

const styles = StyleSheet.create({
  photoWrapper: {
    height: sizes.list.image,
    width: sizes.list.image,
    borderRadius: defaults.borderRadius,
    marginRight: defaults.marginHorizontal / 2
  },
  addPhotoIcon: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginRight: defaults.marginHorizontal / 2
  },
  closeIcon: {
    borderRadius: sizes.list.image / 2,
    backgroundColor: colors.white,
    position: 'absolute',
    left: 30,
    bottom: 30
  },
  listMargin: { marginHorizontal: 0 }
});

export default styles;
