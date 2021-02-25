import PropTypes from 'prop-types';
import React, { forwardRef, useState } from 'react';
import InsetShadow from 'react-native-inset-shadow';
import { Platform, TextInput as RNTextInput, View } from 'react-native';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import Text from 'Components/Text';
import Icon from 'Components/Icon';
import { CustomIcon } from 'Images';
import { ColumnView, RowView } from 'Containers';
import { alphaColor, colors, shadows } from 'Theme';

import style, { sizes } from './style';

const borderColor = (error = false, focused = false, alpha = false) => {
  if (alpha) {
    return alphaColor(error ? 'error' : focused ? 'primary' : 'input', 0.15);
  } else {
    return error ? colors.error : focused ? colors.primary : colors.input;
  }
};

const inputHeight = (
  size = 'normal',
  disableErrors = false,
  multiline = false,
  multilineHeight = 60
) => {
  return multiline
    ? multilineHeight +
        (disableErrors ? 0 : sizes.errorsHeight) +
        sizes.doubleBorderWidth
    : sizes[size] +
        (disableErrors ? 0 : sizes.errorsHeight) +
        sizes.doubleBorderWidth;
};

const TextInput = forwardRef((props, ref) => {
  const {
    autoCapitalize,
    autoFocus,
    error,
    errorMessage,
    disableErrors,
    keyboardType,
    leftIcon,
    maxLength,
    multiline,
    multilineHeight,
    onChangeText,
    onFocusChanged,
    onLeftIconPress,
    onSubmitEditing,
    placeholder,
    returnKeyType,
    secureTextEntry,
    shadow,
    size,
    value
  } = props;
  const [focused, setFocus] = useState(
    ref?.isFocused && ref.isFocused() ? true : false
  );
  const [showPassword, setShowPassword] = useState(false);

  const height = inputHeight(size, disableErrors, multiline, multilineHeight);
  const onFocusChangedInternalEvent = (focus) => {
    setFocus(focus);
    onFocusChanged(focus);
  };

  return (
    <ColumnView
      alignItems={'stretch'}
      justifyContent={'flex-start'}
      height={height}>
      <View
        style={[
          style.inputBorderWrapper,
          {
            ...(shadow && shadows.hintLower),
            borderColor: borderColor(error, focused, true)
          }
        ]}>
        <InsetShadow
          containerStyle={{
            ...style.inputWrapper,
            minHeight: sizes[size],
            borderRadius: sizes.borderRadius,
            borderColor: borderColor(error, focused)
          }}
          {...Platform.select({
            android: { elevation: 2 },
            ios: {
              shadowColor: alphaColor('secondaryDark', focused ? 0.25 : 0.1),
              shadowOffset: 3,
              shadowOpacity: 1,
              shadowRadius: 3
            }
          })}>
          <RowView
            alignItems={multiline ? 'flex-end' : 'center'}
            marginLeft={!leftIcon ? sizes.defaultPadding : null}
            marginRight={!focused ? sizes.defaultPadding : null}
            width={'auto'}>
            {leftIcon && (
              <CustomIcon icon={leftIcon} onPress={onLeftIconPress} />
            )}
            <RNTextInput
              autoCapitalize={autoCapitalize}
              autoFocus={autoFocus}
              keyboardType={keyboardType}
              maxLength={maxLength}
              multiline={multiline}
              onBlur={onFocusChangedInternalEvent.bind(null, false)}
              onChangeText={onChangeText}
              onFocus={onFocusChangedInternalEvent.bind(null, true)}
              onSubmitEditing={onSubmitEditing}
              placeholder={placeholder}
              placeholderTextColor={colors.input}
              ref={ref}
              returnKeyType={returnKeyType}
              secureTextEntry={!showPassword && secureTextEntry}
              style={[
                style.input,
                {
                  minHeight: sizes[size]
                }
              ]}
              {...(multiline && { textAlignVertical: 'top' })}
              defaultValue={value}
            />
            {focused &&
              value?.length > 0 &&
              (secureTextEntry ? (
                <Icon
                  name={'eye'}
                  color={colors.secondary}
                  onPress={setShowPassword.bind(null, !showPassword)}
                  size={24}
                />
              ) : (
                <CustomIcon
                  icon={'close'}
                  onPress={onChangeText.bind(null, '')}
                />
              ))}
          </RowView>
        </InsetShadow>
      </View>
      {!disableErrors && (
        <RowView height={sizes.errorsHeight}>
          {error && (
            <Text.Tag flex={1} align={'right'} color={colors.error}>
              {errorMessage}
            </Text.Tag>
          )}
        </RowView>
      )}
    </ColumnView>
  );
});

TextInput.propTypes = {
  autoCapitalize: PropTypes.string,
  autoFocus: PropTypes.bool,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  disableErrors: PropTypes.bool,
  keyboardType: PropTypes.string,
  leftIcon: PropTypes.string,
  maxLength: PropTypes.any,
  multiline: PropTypes.bool,
  multilineHeight: PropTypes.number,
  onChangeText: PropTypes.func.isRequired,
  onFocusChanged: PropTypes.func.isRequired,
  onLeftIconPress: PropTypes.func.isRequired,
  onSubmitEditing: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  returnKeyType: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  shadow: PropTypes.bool,
  size: PropTypes.string,
  value: PropTypes.string
};

TextInput.defaultProps = {
  autoCapitalize: 'sentences',
  autoFocus: false,
  error: false,
  errorMessage: I18n.t('input:errors:default'),
  disableErrors: false,
  keyboardType: 'default',
  leftIcon: null,
  maxLength: null,
  multiline: false,
  multilineHeight: 60,
  onChangeText: mock,
  onFocusChanged: mock,
  onLeftIconPress: mock,
  onSubmitEditing: mock,
  placeholder: '...',
  secureTextEntry: false,
  shadow: false,
  size: 'large',
  value: ''
};

TextInput.displayName = 'TextInput';
export default TextInput;

export const height = inputHeight;
