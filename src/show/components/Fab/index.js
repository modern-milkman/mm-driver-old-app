//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Animated } from 'react-native';

import Icon from 'Components/Icon';
import { sizes } from 'Theme';
import { useTheme, useThemedStyles } from 'Containers';

import unthemedStyle from './style';

const rotationInterpolation = {
  inputRange: [-1000, 0, 1000],
  outputRange: ['-1000deg', '0deg', '1000deg'],
  extrapolate: 'clamp'
};

const Fab = props => {
  const { colors } = useTheme();
  const {
    bottom,
    color = colors.primary,
    containerSize,
    disabled,
    iconName,
    left,
    onLongPress,
    onPress,
    opacity,
    processing,
    rotate,
    right,
    size,
    testID,
    top,
    type,
    zIndex
  } = props;
  const styles = useThemedStyles(unthemedStyle);
  const composedStyle = {
    borderRadius: containerSize / 2,
    bottom,
    height: containerSize,
    left,
    right,
    top,
    width: containerSize,
    opacity,
    transform: [{ rotate: rotate.interpolate(rotationInterpolation) }],
    zIndex
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
          testID={testID}
        />
      )}
    </Animated.View>
  );
};

Fab.defaultProps = {
  bottom: undefined,
  containerSize: sizes.fab.container,
  disabled: false,
  iconName: 'close-thick',
  left: undefined,
  onLongPress: () => {},
  onPress: () => {},
  opacity: new Animated.Value(1),
  processing: false,
  rotate: new Animated.Value(0),
  right: undefined,
  size: sizes.fab.icon,
  top: undefined,
  type: 'material-community',
  zIndex: 1
};

Fab.propTypes = {
  bottom: PropTypes.number,
  color: PropTypes.string,
  containerSize: PropTypes.number,
  disabled: PropTypes.bool,
  iconName: PropTypes.string,
  left: PropTypes.number,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  opacity: PropTypes.instanceOf(Animated.Value),
  processing: PropTypes.bool,
  right: PropTypes.number,
  rotate: PropTypes.instanceOf(Animated.Value),
  size: PropTypes.number,
  testID: PropTypes.string,
  top: PropTypes.number,
  type: PropTypes.string,
  zIndex: PropTypes.number
};

export default Fab;
