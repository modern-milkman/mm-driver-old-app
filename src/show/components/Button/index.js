import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  View
} from 'react-native';

import Icon from 'Components/Icon';
import Text from 'Components/Text';
import { RowView } from 'Containers';
import { colors, sizes } from 'Theme';

import Types from './Types';
import { style } from './style';

const wrapButtonComponent = (props, type) => <Button {...props} type={type} />;

const Button = (props) => {
  const {
    backgroundOpacity,
    buttonAccessibility,
    disabled,
    icon,
    iconType,
    leftIcon: LeftIcon,
    onPress,
    processing,
    rightIcon: RightIcon,
    textAlign,
    title,
    titleColor,
    type,
    weight,
    width,
    noBorderRadius
  } = props;
  const computedTitleColor = disabled
    ? style.disabled.textStyle.color
    : titleColor
    ? titleColor
    : style[type].textStyle.color;

  return (
    <View
      style={[
        style.container,
        width && { width: width },
        { height: buttonAccessibility }
      ]}>
      <Animated.View
        style={[
          style.container,
          style.absolute,
          style[type].backgroundStyle,
          disabled &&
            !processing && {
              backgroundColor: style.disabled.backgroundColor,
              borderWidth: style.disabled.borderWidth
            },
          { height: buttonAccessibility },
          noBorderRadius && { ...style.noBorderRadius },
          backgroundOpacity && { opacity: backgroundOpacity }
        ]}
      />

      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={style.touchableWrapper}>
        {!processing && (
          <RowView>
            {LeftIcon && <View style={style.leftIcon}>{LeftIcon}</View>}
            <Text.Button
              flex={1}
              color={computedTitleColor}
              align={textAlign}
              weight={weight}
              lineHeight={buttonAccessibility}>
              {title}
            </Text.Button>
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
        {processing && <ActivityIndicator color={colors.white} />}
      </TouchableOpacity>
    </View>
  );
};

Button.propTypes = {
  backgroundOpacity: PropTypes.object,
  buttonAccessibility: PropTypes.number,
  disabled: PropTypes.bool,
  icon: PropTypes.bool,
  iconType: PropTypes.string,
  leftIcon: PropTypes.node,
  noBorderRadius: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  processing: PropTypes.bool,
  rightIcon: PropTypes.node,
  textAlign: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleColor: PropTypes.object,
  type: PropTypes.string,
  weight: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Button.defaultProps = {
  buttonAccessibility: sizes.button.large,
  disabled: false,
  icon: false,
  iconType: 'arrow',
  leftIcon: null,
  noBorderRadius: false,
  onPress: () => {},
  processing: false,
  rightIcon: null,
  textAlign: 'center',
  title: '',
  type: Types.PRIMARY,
  weight: null,
  width: null
};

const exports = {};

Object.values(Types).forEach((type) => {
  exports[type] = connect(
    (state) => ({
      buttonAccessibility: state.device.buttonAccessibility
    }),
    {}
  )((props) => wrapButtonComponent(props, type));
});

export default exports;
