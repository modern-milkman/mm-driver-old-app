import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';

import { RowView } from 'Containers';
import { Icon, Text } from 'Components';

import Types from './Types';
import { style } from './style';

const CallToAction = (props) => <Button {...props} type={Types.CTA} />;
const Destroy = (props) => <Button {...props} type={Types.DESTROY} />;
const Plain = (props) => <Button {...props} type={Types.PLAIN} />;
const Primary = (props) => <Button {...props} shadow type={Types.PRIMARY} />;

const Button = (props) => {
  const {
    disabled,
    icon,
    iconType,
    leftIcon: LeftIcon,
    onPress,
    noMargin,
    processing,
    rightIcon: RightIcon,
    shadow,
    textAlign,
    title,
    type,
    weight,
    width
  } = props;
  const textIconColor = disabled
    ? style.disabled.textStyle.color
    : style[type].textStyle.color;

  return (
    <View
      style={[
        shadow && style.shadow,
        style.container,
        style[type].backgroundStyle,
        disabled && !processing ? style.disabled.backgroundStyle : null,
        width && { width: width }
      ]}>
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={style.touchableWrapper}>
        {!processing && (
          <RowView minHeight={46}>
            {LeftIcon && <View style={style.leftIcon}>{LeftIcon}</View>}
            <Text.Callout
              flex={1}
              noMargin={noMargin}
              color={textIconColor}
              align={textAlign}
              weight={weight}>
              {title}
            </Text.Callout>
            {RightIcon && <View style={style.rightIcon}>{RightIcon}</View>}
            {!!icon && (
              <View style={style.iconStyleContainer}>
                <Icon
                  name={`${iconType}-right`}
                  color={
                    disabled
                      ? style.disabled.textStyle.color
                      : style[type].textStyle.color
                  }
                  size={20}
                  containerSize={20}
                />
              </View>
            )}
          </RowView>
        )}
        {processing && <ActivityIndicator />}
      </TouchableOpacity>
    </View>
  );
};

Button.propTypes = {
  disabled: PropTypes.bool,
  icon: PropTypes.bool,
  iconType: PropTypes.string,
  leftIcon: PropTypes.node,
  onPress: PropTypes.func.isRequired,
  noMargin: PropTypes.bool,
  processing: PropTypes.bool,
  rightIcon: PropTypes.node,
  shadow: PropTypes.bool,
  textAlign: PropTypes.string,
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
  weight: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Button.defaultProps = {
  disabled: false,
  icon: false,
  iconType: 'arrow',
  leftIcon: null,
  onPress: () => {},
  noMargin: false,
  processing: false,
  rightIcon: null,
  shadow: false,
  textAlign: 'center',
  title: '',
  type: Types.PRIMARY,
  weight: null,
  width: null
};

export default {
  CallToAction,
  Destroy,
  Plain,
  Primary
};
