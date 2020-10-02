import { StyleSheet } from 'react-native';

import { defaults, sizes } from 'Theme';

const styles = StyleSheet.create({
  image: {
    height: sizes.list.image,
    width: sizes.list.image,
    borderRadius: defaults.borderRadius
  },
  listItemWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: sizes.list.height,
    width: 'auto',
    marginHorizontal: defaults.marginHorizontal
  },
  renderWrapper: {
    width: '100%'
  }
});

export default styles;
