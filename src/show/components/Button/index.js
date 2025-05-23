//testID supported
import React, { useRef } from 'react';
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
import { RowView, useThemedStyles } from 'Containers';
import { sizes } from 'Theme';

import Types from './Types';
import unthemedStyle from './style';

const wrapButtonComponent = (props, type) => <Button {...props} type={type} />;

const onPressHandler = ({ internallyDisabled, onPress }) => {
  if (!internallyDisabled.current) {
    internallyDisabled.current = true;
    onPress();
    setTimeout(() => {
      internallyDisabled.current = false;
    }, 1000);
  }
};

const Button = props => {
  const {
    backgroundOpacity,
    borderColor,
    buttonAccessibility,
    disabled,
    icon,
    iconType,
    leftIcon: LeftIcon,
    onPress,
    processing,
    rightIcon: RightIcon,
    testID,
    textAlign,
    textFlex,
    title,
    titleColor,
    type,
    weight,
    width,
    noBorderRadius
  } = props;
  const style = useThemedStyles(unthemedStyle);
  const computedTitleColor = disabled
    ? style.disabled.textStyle.color
    : titleColor
    ? titleColor
    : style[type].textStyle.color;

  const internallyDisabled = useRef(false);

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
          backgroundOpacity && { opacity: backgroundOpacity },
          borderColor && { borderColor }
        ]}
      />

      <TouchableOpacity
        disabled={disabled}
        onPress={onPressHandler.bind(null, { internallyDisabled, onPress })}
        style={style.touchableWrapper}
        testID={testID}>
        {!processing && (
          <RowView>
            {LeftIcon && <View style={style.leftIcon}>{LeftIcon}</View>}
            <Text.Button
              flex={textFlex}
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
        {processing && (
          <ActivityIndicator color={style[type].activityIndicatorColor} />
        )}
      </TouchableOpacity>
    </View>
  );
};

Button.propTypes = {
  backgroundOpacity: PropTypes.object,
  borderColor: PropTypes.string,
  buttonAccessibility: PropTypes.number,
  disabled: PropTypes.bool,
  icon: PropTypes.bool,
  iconType: PropTypes.string,
  leftIcon: PropTypes.node,
  noBorderRadius: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  processing: PropTypes.bool,
  rightIcon: PropTypes.node,
  testID: PropTypes.string,
  textAlign: PropTypes.string,
  textFlex: PropTypes.number,
  title: PropTypes.string.isRequired,
  titleColor: PropTypes.string,
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
  textFlex: 1,
  textAlign: 'center',
  title: '',
  type: Types.PRIMARY,
  weight: null,
  width: null
};

const exports = {};

Object.values(Types).forEach(type => {
  exports[type] = connect(
    state => ({
      buttonAccessibility: state.device.buttonAccessibility
    }),
    {}
  )(props => wrapButtonComponent(props, type));
});

export default exports;
