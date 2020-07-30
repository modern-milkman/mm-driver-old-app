import React from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';

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
      {props.children}
    </SafeAreaViewRN>
  );
};

SafeAreaView.defaultProps = {
  bottom: true,
  top: true,
  style: {},
  children: null
};

SafeAreaView.propTypes = {
  bottom: PropTypes.bool,
  top: PropTypes.bool,
  style: PropTypes.any,
  children: PropTypes.node
};

export default SafeAreaView;
