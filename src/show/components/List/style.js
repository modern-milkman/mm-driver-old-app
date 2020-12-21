import { StyleSheet } from 'react-native';

import { defaults, sizes } from 'Theme';

const styles = StyleSheet.create({
  image: {
    height: sizes.list.image,
    maxHeight: sizes.list.image,
    width: sizes.list.image,
    maxWidth: sizes.list.image,
    borderRadius: defaults.borderRadius
  },
  listItemWrapper: {
    flexDirection: 'column',
    marginVertical: defaults.marginVertical / 4,
    width: 'auto',
    marginHorizontal: defaults.marginHorizontal
  },
  renderWrapper: {
    width: '100%'
  }
});

export default styles;
