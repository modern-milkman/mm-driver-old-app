import React from 'react';
import PropTypes from 'prop-types';
import { View, TextInput as RNTextInputV3 } from 'react-native';

import { Text, Icon } from '/show/components';
import { ColumnView, RowView } from '/show/containers';
import { colors } from '/show/resources/theme';

import style from './style';
import { validations as validationMethods } from './validations';
import { digitsOnly as filterDigitsOnly } from '../shared';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      hasError: '',
      erorrMessage: ''
    };
  }

  blurElement = () => {
    this.setState({ focus: false });
    this.props.onFocusChanged(false);
  };

  checkValidations = (validations, value) => {
    if (validations.length > 0) {
      for (const i of validations) {
        if (!validationMethods[i].isValid(value)) {
          return { hasError: true, message: validationMethods[i].message };
        }
      }
    }

    return { hasError: false, message: '' };
  };

  clearInput = () => {
    this._RNTIV3 && this._RNTIV3.clear();
    this.handleChangedText('');
  };

  focus = () => {
    this._RNTIV3.focus();
  };

  focusElement = () => {
    this.setState({ focus: true });
    this.props.onFocusChanged(true);
  };

  handleChangedText = (text) => {
    const {
      digitsOnly,
      onChangeText,
      onChangeValidation,
      validations
    } = this.props;

    const checkedValidation = this.checkValidations(validations, text);

    if (checkedValidation.hasError) {
      this.setState({
        hasError: checkedValidation.hasError,
        erorrMessage: checkedValidation.message
      });
    } else {
      this.setState({ hasError: checkedValidation.hasError });
    }

    onChangeText(digitsOnly ? filterDigitsOnly(text) : text);
    onChangeValidation(checkedValidation.hasError);
  };

  render = () => {
    const {
      autoCapitalize,
      autoFocus,
      darkMode,
      disableErrors,
      keyboardType,
      maxLength,
      multiline,
      noMargin,
      placeholder,
      returnKeyType,
      secureTextEntry,
      title,
      value
    } = this.props;
    const { hasError, erorrMessage, focus } = this.state;
    const textInputNotFocused = !focus;

    return (
      <RowView>
        <ColumnView
          flex={1}
          marginLeft={noMargin ? 0 : 15}
          marginRight={noMargin ? 0 : 15}>
          {title && (
            <RowView justifyContent={'flex-start'}>
              <Text.Footnote noMargin color={colors.primaryLight}>
                {title}
              </Text.Footnote>
            </RowView>
          )}
          <RNTextInputV3
            ref={(RNTIV3) => {
              this._RNTIV3 = RNTIV3;
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.secondaryLight}
            style={[
              style.textInput,
              style.h45,
              textInputNotFocused && style.textInputNotFocused,
              darkMode && style.darkModeTextInput
            ]}
            value={value}
            onChangeText={this.handleChangedText.bind(null)}
            multiline={multiline}
            onFocus={this.focusElement}
            onBlur={this.blurElement}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            maxLength={maxLength}
            returnKeyType={returnKeyType}
            autoFocus={autoFocus}
            secureTextEntry={secureTextEntry}
          />
          {!textInputNotFocused &&
            value !== null &&
            value !== undefined &&
            value.length > 0 && (
              <View style={style.iconClose(disableErrors)}>
                <Icon
                  type="material-community"
                  name="close-circle-outline"
                  size={20}
                  containerSize={20}
                  color={
                    darkMode
                      ? style.iconCloseColor.darkColor
                      : style.iconCloseColor.color
                  }
                  onPress={this.clearInput}
                />
              </View>
            )}

          {!disableErrors && (
            <RowView justifyContent={'flex-end'}>
              <Text.Caption noMargin align="right" color={colors.error}>
                {hasError ? erorrMessage : ' '}
              </Text.Caption>
            </RowView>
          )}
        </ColumnView>
      </RowView>
    );
  };
}

TextInput.defaultProps = {
  autoCapitalize: 'sentences',
  autoFocus: false,
  darkMode: false,
  disableErrors: false,
  digitsOnly: false,
  hasError: false,
  keyboardType: 'default',
  maxLength: null,
  multiline: false,
  noMargin: false,
  title: null,
  validations: [],
  value: '',
  placeholder: '...',
  secureTextEntry: false,
  onChangeText: () => {},
  onFocusChanged: () => {},
  onChangeValidation: () => {}
};

TextInput.propTypes = {
  autoCapitalize: PropTypes.string,
  autoFocus: PropTypes.bool,
  darkMode: PropTypes.bool,
  disableErrors: PropTypes.bool,
  digitsOnly: PropTypes.bool,
  hasError: PropTypes.bool,
  keyboardType: PropTypes.string,
  maxLength: PropTypes.any,
  multiline: PropTypes.bool,
  noMargin: PropTypes.bool,
  title: PropTypes.string,
  validations: PropTypes.array,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  returnKeyType: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  onChangeText: PropTypes.func.isRequired,
  onChangeValidation: PropTypes.func,
  onFocusChanged: PropTypes.func
};

export default TextInput;
