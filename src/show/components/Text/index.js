//testID supported
/*
GUIDELINES
iOS:      https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
Android:  https://material.io/guidelines/style/typography.html#typography-styles
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

import { defaults } from 'Theme';

import Types from './Types';
import style from './style';

const wrapTextComponent = (props, type) => <Text {...props} type={type} />;

const Text = props => {
  const {
    align,
    children,
    color,
    flex = null,
    lineHeight = null,
    type = Types.CAPTION,
    underline = false,
    weight = null,
    ...rest
  } = props;
  let humanoidMaterialStyles = null;

  return (
    (!!children && (
      <Animated.Text
        {...rest}
        style={[
          humanoidMaterialStyles,
          style[type].textStyle,
          weight && style.fontWeight(weight),
          {
            color,
            textAlign: align,
            ...(align === 'left' &&
              type === 'Button' && {
                marginLeft: defaults.paddingHorizontal / 2
              })
          },
          flex && style.flex,
          lineHeight && { lineHeight },
          underline && style.underline
        ]}>
        {children}
      </Animated.Text>
    )) ||
    null
  );
};

const exports = {};
Object.values(Types).forEach(type => {
  exports[type] = props => wrapTextComponent(props, type);
  exports[type].style = style[type].textStyle;
  exports[type].height = style[type].textStyle.lineHeight;
});

Text.propTypes = {
  align: PropTypes.string,
  color: PropTypes.any,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  flex: PropTypes.number,
  lineHeight: PropTypes.number,
  numberOfLines: PropTypes.number,
  type: PropTypes.string,
  underline: PropTypes.bool,
  weight: PropTypes.string
};

export default exports;
