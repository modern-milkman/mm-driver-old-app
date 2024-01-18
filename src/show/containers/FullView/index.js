//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { useTheme } from 'Containers';

import style from './style';

const FullView = props => {
  const { colors } = useTheme();
  const { bgColor = colors.neutral, behaviour, children, testID } = props;
  const composedStyles = [style.fullview, { backgroundColor: bgColor }];

  return (
    <KeyboardAvoidingView
      {...behaviour}
      enabled
      style={composedStyles}
      testID={testID}>
      {children}
    </KeyboardAvoidingView>
  );
};

FullView.propTypes = {
  behaviour: PropTypes.object,
  bgColor: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  testID: PropTypes.string
};

FullView.defaultProps = {
  behaviour: {
    ...Platform.select({
      ios: {
        behavior: 'padding'
      },
      android: {
        behavior: 'height'
      }
    })
  },
  children: null
};

export default FullView;
