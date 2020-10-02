import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { colors } from 'Theme';

const Separator = (props) => {
  const {
    borderRadius,
    color,
    height,
    marginHorizontal,
    marginLeft,
    marginRight,
    vertical,
    width
  } = props;
  let computedHeight, computedWidth;
  if (vertical) {
    computedWidth = width ? width : 1;
    computedHeight = height ? height : 'auto';
  } else {
    computedWidth = width ? width : 'auto';
    computedHeight = height ? height : 1;
  }

  const composeStyles = {
    backgroundColor: color,
    borderRadius: borderRadius,
    height: computedHeight,
    marginLeft: marginLeft || marginHorizontal || 0,
    marginRight: marginRight || marginHorizontal || 0,
    width: computedWidth
  };

  return <View style={composeStyles} />;
};

Separator.propTypes = {
  borderRadius: PropTypes.oneOfType(PropTypes.number, PropTypes.string),
  color: PropTypes.string,
  flex: PropTypes.number,
  height: PropTypes.oneOfType(PropTypes.number, PropTypes.string),
  justifyContent: PropTypes.string,
  marginHorizontal: PropTypes.number,
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  vertical: PropTypes.bool,
  width: PropTypes.oneOfType(PropTypes.number, PropTypes.string)
};

Separator.defaultProps = {
  borderRadius: undefined,
  color: colors.input,
  height: undefined,
  marginHorizontal: 0,
  marginLeft: 0,
  marginRight: 0,
  vertical: false,
  width: 'auto'
};

export default Separator;
