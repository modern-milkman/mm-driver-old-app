import { StyleSheet } from 'react-native';

import { configuration } from '../../helpers';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 2,
    top: 0,

    height: configuration.pullHandle.height,
    borderTopLeftRadius: configuration.topBorderRadius.max,
    borderTopRightRadius: configuration.topBorderRadius.max
  }
});

export default styles;
