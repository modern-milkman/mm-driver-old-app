import { StyleSheet } from 'react-native';

import { defaults, sizes } from 'Theme';

export default ({ colors }) =>
  StyleSheet.create({
    photoWrapper: {
      height: sizes.list.image,
      width: sizes.list.image,
      borderRadius: defaults.borderRadius
    },
    addPhotoIcon: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
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
