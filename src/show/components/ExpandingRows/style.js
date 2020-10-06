import { StyleSheet } from 'react-native';

import { defaults, sizes } from 'Theme';

const styles = StyleSheet.create({
  image: {
    height: sizes.list.image,
    width: sizes.list.image,
    borderRadius: defaults.borderRadius
  }
});

export default styles;
