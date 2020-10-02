import PropTypes from 'prop-types';
import { Animated, Keyboard, Platform } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deviceFrame } from 'Helpers';

const { height } = deviceFrame();

const useKeyboardEvent = (event, callback) => {
  useEffect(() => {
    Keyboard.addListener(event, callback);

    return () => {
      Keyboard.removeListener(event, callback);
    };
  }, [event, callback]);
};

const SafeKeyboardAreaView = ({ children, scrollEnabled, style }) => {
  const { bottom, top } = useSafeAreaInsets();
  const SKAVmaxHeight = height - (bottom + top);
  const [SKAVheight] = useState(new Animated.Value(SKAVmaxHeight));

  const automatedStyle = {
    height: SKAVheight,
    maxHeight: SKAVheight,
    width: '100%'
  };

  const keyboardEvent = useCallback(
    (type, e) => {
      Animated.timing(SKAVheight, {
        toValue:
          type === 'show'
            ? SKAVmaxHeight - e.endCoordinates.height + bottom
            : SKAVmaxHeight,
        duration: 250,
        useNativeDriver: false
      }).start();
    },
    [bottom, SKAVheight, SKAVmaxHeight]
  );

  useKeyboardEvent(
    `keyboard${Platform.OS === 'ios' ? 'Will' : 'Did'}Show`,
    keyboardEvent.bind(null, 'show')
  );
  useKeyboardEvent(
    `keyboard${Platform.OS === 'ios' ? 'Will' : 'Did'}Hide`,
    keyboardEvent.bind(null, 'hide')
  );

  return (
    <Animated.ScrollView
      keyboardShouldPersistTaps={'handled'}
      style={automatedStyle}
      contentContainerStyle={style}
      scrollEnabled={scrollEnabled}>
      {children}
    </Animated.ScrollView>
  );
};

SafeKeyboardAreaView.defaultProps = {
  children: null,
  maxHeight: undefined,
  scrollEnabled: true,
  style: {}
};

SafeKeyboardAreaView.propTypes = {
  children: PropTypes.node,
  maxHeight: PropTypes.number,
  scrollEnabled: PropTypes.bool,
  style: PropTypes.any
};

export default SafeKeyboardAreaView;
