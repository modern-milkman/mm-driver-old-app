import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

import style from './style';

const Foreground = (props) => {
  const {
    backgroundColor,
    children,
    height,
    paddingBottom,
    paddingTop,
    pullHandleMoveY,
    topBorderRadius
  } = props;

  return (
    <Animated.View
      style={[
        style.container,
        {
          paddingBottom,
          paddingTop,
          borderRadius: topBorderRadius,
          transform: [{ translateY: pullHandleMoveY }],
          backgroundColor
        }
      ]}>
      <Animated.View
        style={[
          {
            height: height
          }
        ]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

Foreground.propTypes = {
  backgroundColor: PropTypes.instanceOf(Animated.Value),
  children: PropTypes.node,
  height: PropTypes.object,
  paddingBottom: PropTypes.number,
  paddingTop: PropTypes.instanceOf(Animated.Value),
  pullHandleMoveY: PropTypes.instanceOf(Animated.Value),
  topBorderRadius: PropTypes.object
};

export default Foreground;
