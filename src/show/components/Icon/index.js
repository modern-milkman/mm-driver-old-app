import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors } from 'Theme';

import defaultStyle from './style';

const Icon = (props) => {
  const {
    circle,
    circleColor,
    color,
    containerSize,
    disabled,
    name,
    onPress,
    type,
    size,
    style
  } = props;

  const circleStyle = {
    ...defaultStyle.circleStyle(containerSize, size),
    backgroundColor: circleColor
  };

  return (
    <View style={[defaultStyle.iconDefaultContainerSize(containerSize)]}>
      <View style={circle && circleStyle} />
      <RNEIcon
        color={color}
        iconStyle={[
          defaultStyle.iconDefaultStyle(containerSize),
          defaultStyle.iconDefaultContainerSize(containerSize),
          style
        ]}
        name={name}
        onPress={!disabled ? onPress : null}
        size={size}
        type={type}
        underlayColor={'transparent'}
      />
    </View>
  );
};

Icon.propTypes = {
  circle: PropTypes.bool,
  circleColor: PropTypes.string,
  color: PropTypes.any,
  containerSize: PropTypes.number,
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  name: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.any,
  type: PropTypes.string
};

Icon.defaultProps = {
  circle: false,
  circleColor: colors.standard,
  color: colors.primary,
  containerSize: 44,
  disabled: false,
  name: 'circle',
  onPress: () => {},
  size: 32,
  style: {},
  type: 'material-community'
};

export default Icon;
