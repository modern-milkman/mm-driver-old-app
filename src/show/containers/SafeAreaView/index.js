//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';

import { useTheme } from 'Containers';

const SafeAreaView = props => {
  const { colors } = useTheme();
  const { bottom, testID, top } = props;
  const defaultStyle = {
    backgroundColor: colors.neutral,
    flex: 1
  };

  const edges = ['right', 'left'];

  if (top) {
    edges.push('top');
  }
  if (bottom) {
    edges.push('bottom');
  }

  return (
    <SafeAreaViewRN
      style={[defaultStyle, props.style]}
      edges={edges}
      testID={testID}>
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
  testID: PropTypes.string,
  top: PropTypes.bool,
  style: PropTypes.any,
  children: PropTypes.node
};

export default SafeAreaView;
