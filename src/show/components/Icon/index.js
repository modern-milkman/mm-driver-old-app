//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';

import { mock } from 'Helpers';
import { useTheme } from 'Containers';

import defaultStyle from './style';

const Icon = props => {
  const { colors } = useTheme();
  const {
    color = colors.primary,
    containerSize = 44,
    disabled = false,
    name = 'circle',
    onLongPress = mock,
    onPress = mock,
    testID,
    type = 'material-community',
    size = 32,
    style = {}
  } = props;

  return (
    <View style={[defaultStyle.iconDefaultContainerSize(containerSize)]}>
      <RNEIcon
        color={color}
        disabled={disabled}
        disabledStyle={defaultStyle.disabledStyle}
        iconStyle={[
          defaultStyle.iconDefaultStyle(containerSize),
          defaultStyle.iconDefaultContainerSize(containerSize),
          style
        ]}
        name={name}
        onPress={onPress}
        onLongPress={onLongPress}
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

export default Icon;
