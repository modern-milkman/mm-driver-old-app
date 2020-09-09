import React from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';

import SafeKeyboardAreaView from 'Containers/SafeKeyboardAreaView';

const SafeAreaView = (props) => {
  const { bottom, top } = props;
  const defaultTransparency = {
    backgroundColor: 'transparent'
  };

  const edges = ['right', 'left'];

  if (top) {
    edges.push('top');
  }
  if (bottom) {
    edges.push('bottom');
  }

  return (
    <SafeAreaViewRN style={[defaultTransparency, props.style]} edges={edges}>
      {props.keyboardSafe && (
        <SafeKeyboardAreaView style={props.keyboardSafeStyle}>
          {props.children}
        </SafeKeyboardAreaView>
      )}
      {!props.keyboardSafe && props.children}
    </SafeAreaViewRN>
  );
};

SafeAreaView.defaultProps = {
  bottom: true,
  keyboardSafe: false,
  top: true,
  style: {},
  keyboardSafeStyle: {},
  children: null
};

SafeAreaView.propTypes = {
  bottom: PropTypes.bool,
  keyboardSafe: PropTypes.bool,
  keyboardSafeStyle: PropTypes.any,
  top: PropTypes.bool,
  style: PropTypes.any,
  children: PropTypes.node
};

export default SafeAreaView;
