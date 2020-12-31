import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Animated } from 'react-native';

import { colors } from 'Theme';
import Icon from 'Components/Icon';

import styles from './style';

const Fab = (props) => {
  const {
    bottom,
    color,
    containerSize,
    disabled,
    iconName,
    fabTop,
    left,
    onLongPress,
    onPress,
    processing,
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
    width: containerSize,
    transform: [{ translateY: fabTop }]
  };

  return (
    <Animated.View style={{ ...styles.fabCurrentLocation, ...composedStyle }}>
      {processing ? (
        <ActivityIndicator style={styles.activityIndicator} size="small" />
      ) : (
        <Icon
          type={type}
          name={iconName}
          size={size}
          containerSize={containerSize}
          color={color}
          onPress={onPress}
          disabled={disabled}
          onLongPress={onLongPress}
        />
      )}
    </Animated.View>
  );
};

Fab.defaultProps = {
  bottom: undefined,
  color: colors.primary,
  containerSize: 56,
  disabled: false,
  iconName: 'close-thick',
  left: undefined,
  onLongPress: () => {},
  onPress: () => {},
  processing: false,
  right: undefined,
  size: 44,
  top: undefined,
  type: 'material-community'
};

Fab.propTypes = {
  bottom: PropTypes.number,
  color: PropTypes.string,
  containerSize: PropTypes.number,
  disabled: PropTypes.bool,
  iconName: PropTypes.string,
  fabTop: PropTypes.instanceOf(Animated.Value),
  left: PropTypes.number,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  processing: PropTypes.bool,
  right: PropTypes.number,
  size: PropTypes.number,
  top: PropTypes.number,
  type: PropTypes.string
};

export default Fab;
