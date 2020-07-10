import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { colors } from 'Resources/theme';

import style from './style';
const behaviour = {
  ...Platform.select({
    ios: {
      behavior: 'padding'
    }
  })
};

const FullView = (props) => {
  const composedStyles = [style.fullview, { backgroundColor: props.bgColor }];
  return (
    <KeyboardAvoidingView {...behaviour} enabled style={composedStyles}>
      {props.children}
    </KeyboardAvoidingView>
  );
};

FullView.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  bgColor: PropTypes.string
};

FullView.defaultProps = {
  children: null,
  bgColor: colors.background
};

export default FullView;
