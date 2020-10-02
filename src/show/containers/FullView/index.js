import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { colors } from 'Theme';

import style from './style';

const FullView = (props) => {
  const composedStyles = [style.fullview, { backgroundColor: props.bgColor }];

  return (
    <KeyboardAvoidingView {...props.behaviour} enabled style={composedStyles}>
      {props.children}
    </KeyboardAvoidingView>
  );
};

FullView.propTypes = {
  behaviour: PropTypes.object,
  bgColor: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

FullView.defaultProps = {
  behaviour: {
    ...Platform.select({
      ios: {
        behavior: 'padding'
      }
    })
  },
  bgColor: colors.neutral,
  children: null
};

export default FullView;
