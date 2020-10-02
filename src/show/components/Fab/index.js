import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { colors } from 'Theme';
import Icon from 'Components/Icon';

import styles from './style';

const Fab = (props) => {
  const {
    bottom,
    color,
    containerSize,
    iconName,
    left,
    onLongPress,
    onPress,
    right,
    size,
    top,
    type
  } = props;

  const composedStyle = {
    borderRadius: containerSize / 2,
    bottom,
    height: containerSize,
    left,
    right,
    top,
    width: containerSize
  };

  return (
    <View style={{ ...styles.fabCurrentLocation, ...composedStyle }}>
      <Icon
        type={type}
        name={iconName}
        size={size}
        containerSize={containerSize}
        color={color}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    </View>
  );
};

Fab.defaultProps = {
  bottom: undefined,
  color: colors.primary,
  containerSize: 56,
  iconName: 'close-thick',
  left: undefined,
  onLongPress: () => {},
  onPress: () => {},
  right: undefined,
  size: 44,
  top: undefined,
  type: 'material-community'
};

Fab.propTypes = {
  bottom: PropTypes.number,
  color: PropTypes.string,
  containerSize: PropTypes.number,
  iconName: PropTypes.string,
  left: PropTypes.number,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  right: PropTypes.number,
  size: PropTypes.number,
  top: PropTypes.number,
  type: PropTypes.string
};

export default Fab;
