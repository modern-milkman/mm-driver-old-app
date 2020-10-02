/*
justifyContent  - vertical alignment / primary axis
alignItems      - horizontal alignment / secondary axis
*/

import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from '@react-navigation/native';
import { View, Animated } from 'react-native';

const ColumnRowView = (props) => {
  const composedStyles = {
    backgroundColor: props.backgroundColor,
    ...props.animatedStyle
  };
  const composeScrollableStyles = {
    alignItems: props.alignItems,
    borderRadius: props.borderRadius,
    justifyContent: props.justifyContent,
    flex: props.flex,
    flexDirection: props.flexDirection,
    flexGrow: props.flexGrow,
    width: props.width,
    height: props.height,
    marginBottom: props.marginBottom || props.marginVertical || 0,
    marginLeft: props.marginLeft || props.marginHorizontal || 0,
    marginRight: props.marginRight || props.marginHorizontal || 0,
    marginTop: props.marginTop || props.marginVertical || 0,
    overflow: props.overflow,
    paddingBottom: props.paddingBottom || props.paddingVertical || 0,
    paddingLeft: props.paddingLeft || props.paddingHorizontal || 0,
    paddingRight: props.paddingRight || props.paddingHorizontal || 0,
    paddingTop: props.paddingTop || props.paddingVertical || 0,

    maxHeight: props.maxHeight,
    minHeight: props.minHeight
  };

  const CRWiewComponent = props.animated
    ? props.scrollable
      ? Animated.ScrollView
      : Animated.View
    : props.scrollable
    ? ScrollView
    : View;

  return (
    <CRWiewComponent
      keyboardShouldPersistTaps={'handled'}
      style={[composedStyles, !props.scrollable && composeScrollableStyles]}
      contentContainerStyle={composeScrollableStyles}
      onLayout={props.onLayout}>
      {props.children}
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
  marginBottom: PropTypes.number,
  marginHorizontal: PropTypes.number,
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  marginTop: PropTypes.number,
  marginVertical: PropTypes.number,
  paddingBottom: PropTypes.number,
  paddingHorizontal: PropTypes.number,
  paddingLeft: PropTypes.number,
  paddingRight: PropTypes.number,
  paddingTop: PropTypes.number,
  paddingVertical: PropTypes.number,
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number,
  onLayout: PropTypes.func,
  overflow: PropTypes.string,
  scrollable: PropTypes.bool,
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
  overflow: undefined,
  paddingBottom: undefined,
  paddingHorizontal: undefined,
  paddingLeft: undefined,
  paddingRight: undefined,
  paddingTop: undefined,
  paddingVertical: undefined,
  maxHeight: undefined,
  minHeight: 0,
  scrollable: false,
  width: '100%'
};

export default ColumnRowView;
