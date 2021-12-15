//testID supported
/*
justifyContent  - vertical alignment / primary axis
alignItems      - horizontal alignment / secondary axis
*/

import React from 'react';
import PropTypes from 'prop-types';
import { View, Animated, ScrollView } from 'react-native';

import { shadows } from 'Theme';

const ColumnRowView = ({
  alignItems,
  animated,
  animatedStyle,
  backgroundColor,
  borderRadius,
  children,
  flex,
  flexDirection,
  flexGrow,
  height,
  justifyContent,
  marginBottom,
  marginHorizontal,
  marginLeft,
  marginRight,
  marginTop,
  marginVertical,
  maxHeight,
  minHeight,
  onLayout,
  overflow,
  paddingBottom,
  paddingHorizontal,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingVertical,
  scrollable,
  shadow,
  testID,
  width
}) => {
  const composedStyles = {
    backgroundColor: backgroundColor
  };

  const composeScrollableStyles = {
    alignItems: alignItems,
    borderRadius: borderRadius,
    justifyContent: justifyContent,
    flex: flex,
    flexDirection: flexDirection,
    flexGrow: flexGrow,
    width: width,
    height: height,
    marginBottom: marginBottom || marginVertical || 0,
    marginLeft: marginLeft || marginHorizontal || 0,
    marginRight: marginRight || marginHorizontal || 0,
    marginTop: marginTop || marginVertical || 0,
    maxHeight: maxHeight,
    minHeight: minHeight,
    overflow: overflow,
    paddingBottom: paddingBottom || paddingVertical || 0,
    paddingLeft: paddingLeft || paddingHorizontal || 0,
    paddingRight: paddingRight || paddingHorizontal || 0,
    paddingTop: paddingTop || paddingVertical || 0,
    ...(shadow && shadows.hintLower)
  };

  const CRWiewComponent = animated
    ? scrollable
      ? Animated.ScrollView
      : Animated.View
    : scrollable
    ? ScrollView
    : View;

  return (
    <CRWiewComponent
      keyboardShouldPersistTaps={'handled'}
      style={[
        composedStyles,
        !scrollable && composeScrollableStyles,
        animated && { ...animatedStyle }
      ]}
      contentContainerStyle={composeScrollableStyles}
      onLayout={onLayout}
      testID={testID}>
      {children}
    </CRWiewComponent>
  );
};

ColumnRowView.propTypes = {
  alignItems: PropTypes.string,
  animated: PropTypes.bool,
  animatedStyle: PropTypes.any,
  backgroundColor: PropTypes.string,
  borderRadius: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  flex: PropTypes.number,
  flexDirection: PropTypes.string,
  flexGrow: PropTypes.number,
  height: PropTypes.oneOfType(PropTypes.number, PropTypes.string),
  justifyContent: PropTypes.string,
  onLayout: PropTypes.func,
  overflow: PropTypes.string,
  marginBottom: PropTypes.number,
  marginHorizontal: PropTypes.number,
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  marginTop: PropTypes.number,
  marginVertical: PropTypes.number,
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number,
  paddingBottom: PropTypes.number,
  paddingHorizontal: PropTypes.number,
  paddingLeft: PropTypes.number,
  paddingRight: PropTypes.number,
  paddingTop: PropTypes.number,
  paddingVertical: PropTypes.number,
  scrollable: PropTypes.bool,
  shadow: PropTypes.bool,
  testID: PropTypes.string,
  width: PropTypes.oneOfType(PropTypes.number, PropTypes.string)
};

ColumnRowView.defaultProps = {
  alignItems: 'center',
  animated: false,
  animatedStyle: null,
  borderRadius: 0,
  children: null,
  flex: 0,
  flexDirection: 'column',
  height: null,
  justifyContent: 'center',
  marginBottom: undefined,
  marginHorizontal: undefined,
  marginLeft: undefined,
  marginRight: undefined,
  marginTop: undefined,
  marginVertical: undefined,
  maxHeight: undefined,
  minHeight: 0,
  overflow: undefined,
  paddingBottom: undefined,
  paddingHorizontal: undefined,
  paddingLeft: undefined,
  paddingRight: undefined,
  paddingTop: undefined,
  paddingVertical: undefined,
  scrollable: false,
  shadow: false,
  width: '100%'
};

export default ColumnRowView;
