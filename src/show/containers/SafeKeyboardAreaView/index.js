import PropTypes from 'prop-types';
import { Animated, Keyboard } from 'react-native';
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

const SafeKeyboardAreaView = (props) => {
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

  useKeyboardEvent('keyboardWillShow', keyboardEvent.bind(null, 'show'));
  useKeyboardEvent('keyboardWillHide', keyboardEvent.bind(null, 'hide'));

  return (
    <Animated.ScrollView
      keyboardShouldPersistTaps={'handled'}
      style={automatedStyle}
      contentContainerStyle={props.style}>
      {props.children}
    </Animated.ScrollView>
  );
};

SafeKeyboardAreaView.defaultProps = {
  children: null,
  maxHeight: undefined,
  style: {}
};

SafeKeyboardAreaView.propTypes = {
  children: PropTypes.node,
  maxHeight: PropTypes.number,
  style: PropTypes.any
};

export default SafeKeyboardAreaView;
