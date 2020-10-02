import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

import style from './style';

const PullHandle = (props) => {
  const { pullHandlePanResponder, width } = props;
  return (
    <Animated.View
      style={[style.container, { width }]}
      {...pullHandlePanResponder.panHandlers}
    />
  );
};

PullHandle.propTypes = {
  pullHandlePanResponder: PropTypes.object,
  width: PropTypes.object
};

export default PullHandle;
