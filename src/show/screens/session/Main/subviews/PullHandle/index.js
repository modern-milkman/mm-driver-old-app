import React from 'react';
import PropTypes from 'prop-types';
import { Animated, TouchableOpacity } from 'react-native';

import { colors } from 'Theme';
import { Icon } from 'Components';

import style from './style';

const PullHandle = (props) => {
  const {
    chevronDownOpacity,
    chevronDownOnPress,
    pullHandlePanResponder,
    width
  } = props;
  return (
    <Animated.View
      style={[style.container, { width }]}
      {...pullHandlePanResponder.panHandlers}>
      <Animated.View style={{ opacity: chevronDownOpacity }}>
        <TouchableOpacity activeOpacity={0.9} onPress={chevronDownOnPress}>
          <Icon
            name={'chevron-down'}
            color={colors.primary}
            size={32}
            containerSize={44}
            disabled
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

PullHandle.propTypes = {
  chevronDownOnPress: PropTypes.func,
  chevronDownOpacity: PropTypes.object,
  pullHandlePanResponder: PropTypes.object,
  width: PropTypes.object
};

export default PullHandle;
