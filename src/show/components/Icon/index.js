//testID supported
import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors } from 'Theme';

import defaultStyle from './style';

const Icon = props => {
  const {
    color,
    containerSize,
    disabled,
    name,
    onLongPress,
    onPress,
    testID,
    type,
    size,
    style
  } = props;

  return (
    <View style={[defaultStyle.iconDefaultContainerSize(containerSize)]}>
      <RNEIcon
        color={color}
        iconStyle={[
          defaultStyle.iconDefaultStyle(containerSize),
          defaultStyle.iconDefaultContainerSize(containerSize),
          style
        ]}
        name={name}
        onPress={!disabled ? onPress : null}
        onLongPress={!disabled ? onLongPress : null}
        size={size}
        type={type}
        underlayColor={'transparent'}
        testID={testID}
      />
    </View>
  );
};

Icon.propTypes = {
  color: PropTypes.any,
  containerSize: PropTypes.number,
  disabled: PropTypes.bool,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  name: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.any,
  testID: PropTypes.string,
  type: PropTypes.string
};

Icon.defaultProps = {
  color: colors.primary,
  containerSize: 44,
  disabled: false,
  name: 'circle',
  onLongPress: () => {},
  onPress: () => {},
  size: 32,
  style: {},
  type: 'material-community'
};

export default Icon;
