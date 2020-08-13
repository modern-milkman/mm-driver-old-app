import React from 'react';
import PropTypes from 'prop-types';
import { View, TextInput as RNTextInputV3 } from 'react-native';

import { colors } from 'Theme';
import { ColumnView, RowView } from 'Containers';

import style from './style';
import { validations as validationMethods } from './validations';

import Icon from '../Icon';
import Text from '../Text';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: '',
      focused: false,
      hasError: '',
      internalValue: props.value
    };
  }

  blurElement = () => {
    this.setState({ focused: false });
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

  componentDidUpdate = (previousProps, previousState) => {
    const { onChangeValidation } = this.props;
    const { hasError, errorMessage } = this.state;
    if (
      hasError !== previousState.hasError ||
      errorMessage !== previousState.errorMessage
    ) {
      onChangeValidation(hasError);
    }
  };

  focus = () => {
    this._RNTIV3.focus();
  };

  focusElement = () => {
    this.setState({ focused: true });
    this.props.onFocusChanged(true);
  };

  handleChangedText = (text) => {
    const { onChangeText, validations } = this.props;
    this.setState({ internalValue: text });
    onChangeText(text);
    if (validations.length > 0) {
      this.handleValidations(text);
    }
  };

  handleValidations = (text) => {
    const { validations } = this.props;
    const checkedValidation = this.checkValidations(validations, text);

    if (checkedValidation.hasError) {
      this.setState({
        hasError: checkedValidation.hasError,
        errorMessage: checkedValidation.message
      });
    } else {
      this.setState({ hasError: checkedValidation.hasError });
    }
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
      rightIcon,
      rightIconAction,
      secureTextEntry,
      style: styleProp,
      title,
      value
    } = this.props;
    const { errorMessage, focused, hasError, internalValue } = this.state;
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
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            keyboardType={keyboardType}
            maxLength={maxLength}
            multiline={multiline}
            placeholder={placeholder}
            placeholderTextColor={colors.secondaryLight}
            returnKeyType={returnKeyType}
            secureTextEntry={secureTextEntry}
            style={[
              style.textInput,
              style.h45,
              focused && style.textInputFocused,
              darkMode && style.darkModeTextInput,
              styleProp
            ]}
            onBlur={this.blurElement}
            onChangeText={this.handleChangedText.bind(null)}
            onFocus={this.focusElement}
            defaultValue={focused ? internalValue : value}
          />
          {focused && (
            <View style={style.iconClose(disableErrors)}>
              <Icon
                type="material-community"
                name={rightIcon}
                size={20}
                containerSize={46}
                width={23}
                color={
                  darkMode
                    ? style.iconCloseColor.darkColor
                    : style.iconCloseColor.color
                }
                onPress={rightIconAction ? rightIconAction : this.clearInput}
              />
            </View>
          )}

          {!disableErrors && (
            <RowView justifyContent={'flex-end'}>
              <Text.Caption noMargin align="right" color={colors.error}>
                {hasError ? errorMessage : ' '}
              </Text.Caption>
            </RowView>
          )}
        </ColumnView>
      </RowView>
    );
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    return (
      this.state.focused !== nextState.focused ||
      this.state.hasError !== nextState.hasError ||
      this.state.errorMessage !== nextState.errorMessage
    );
  };
}

TextInput.defaultProps = {
  autoCapitalize: 'sentences',
  autoFocus: false,
  darkMode: false,
  disableErrors: false,
  hasError: false,
  keyboardType: 'default',
  maxLength: null,
  multiline: false,
  noMargin: false,
  title: null,
  validations: [],
  value: '',
  placeholder: '...',
  rightIcon: 'close-circle-outline',
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
  rightIcon: PropTypes.string,
  rightIconAction: PropTypes.func,
  secureTextEntry: PropTypes.bool,
  style: PropTypes.any,
  onChangeText: PropTypes.func.isRequired,
  onChangeValidation: PropTypes.func,
  onFocusChanged: PropTypes.func
};

export default TextInput;
