import React from 'react';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';

const SafeAreaView = (props) => {
  const defaultTransparency = {
    backgroundColor: 'transparent'
  };

  return (
    <SafeAreaViewRN
      style={[defaultTransparency, props.style]}
      {...Platform.select({
        ios: {
          forceInset: {
            bottom: props.bottom ? 'always' : 'never',
            top: props.top ? 'always' : 'never'
          }
        }
      })}>
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
