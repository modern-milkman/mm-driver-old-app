import { StyleSheet } from 'react-native';

import { colors } from 'Theme';
import { deviceFrame } from 'Helpers';

const { width } = deviceFrame();

const listMargin = 8;

const style = StyleSheet.create({
  container: {
    zIndex: 1,
    top: 0,
    right: 0,
    left: 0,
    width: '100%'
  },
  searchWrapper: {
    zIndex: -1,
    left: 0,
    right: 0,
    top: 50
  },
  listWrapper: {
    backgroundColor: colors.background,
    marginTop: 20,
    borderColor: colors.black,
    borderWidth: 1,
    borderRadius: 14,
    width: width - listMargin * 2,
    marginHorizontal: 8
  },
  height100: { height: '100%' },
  overflowHidden: { overflow: 'hidden' }
});

export default style;
