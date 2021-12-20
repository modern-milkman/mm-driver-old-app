import PropTypes from 'prop-types';
import { Animated, Keyboard } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';

import I18n from 'Locales/I18n';
import { CarLogo } from 'Images';
import { colors, defaults } from 'Theme';
import Vibration from 'Services/vibration';
import EncryptedStorage from 'Services/encryptedStorage';
import { Button, Icon, Label, Switch, Text } from 'Components';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import TextInput, { height as textInputHeight } from 'Components/TextInput';
import { appVersionString, jiggleAnimation, mock, deviceFrame } from 'Helpers';

const emailReference = React.createRef();
const passwordReference = React.createRef();
const logoSize = 100;
const minimumKeyboardHeight = 300;
const minimumRequiredHeight =
  textInputHeight('large') * 2 +
  Text.Button.height * 2 +
  Text.Label.height +
  Text.Caption.height +
  logoSize +
  Text.Heading.height +
  defaults.marginVertical / 4 +
  defaults.marginVertical * 2; // make things look spacious
const focusPassword = () => {
  passwordReference?.current?.focus();
};

const checkRememberMe = async updateTransientProps => {
  const credentials = await EncryptedStorage.get('userCredentials');
  if (credentials) {
    const { email, password } = credentials;
    updateTransientProps({
      password,
      email
    });
  }
};

const focusEmail = () => {
  setTimeout(() => {
    emailReference?.current?.focus();
  }, 0);
};

const renderBiometrics = ({
  biometrics,
  biometricLogin,
  processing,
  disabledLogin
}) => (
  <>
    <RowView marginVertical={defaults.marginVertical / 2}>
      <Text.Label align={'center'} color={colors.inputDark}>
        {I18n.t('general:or')}
      </Text.Label>
    </RowView>
    <Button.Secondary
      leftIcon={
        <Icon
          name={'fingerprint'}
          color={colors.white}
          size={40}
          containerSize={40}
        />
      }
      textFlex={0}
      title={I18n.t(
        `screens:home.biometrics.${biometrics.active ? 'login' : 'setup'}`
      )}
      onPress={biometricLogin}
      processing={processing}
      disabled={disabledLogin}
    />
  </>
);

const renderLogo = hasSmallHeight => (
  <ColumnView
    flex={hasSmallHeight ? 0 : 2}
    width={'100%'}
    justifyContent={'center'}
    alignItems={'center'}
    height={logoSize / (82 / 56) + Text.Heading.height}>
    <CarLogo width={logoSize} disabled />
    <ColumnView height={Text.Heading.height}>
      <Text.Heading textAlign={'center'} color={colors.primary}>
        {I18n.t('screens:home.driver')}
      </Text.Heading>
    </ColumnView>
  </ColumnView>
);

const renderRememberMe = ({
  rememberMe,
  updateDeviceProps,
  updateTransientProps
}) => (
  <RowView
    justifyContent={'space-between'}
    width={'auto'}
    marginVertical={defaults.marginVertical}>
    <Text.List color={colors.inputDark}>
      {I18n.t('screens:home.rememberMe')}
    </Text.List>
    <Switch
      value={rememberMe}
      onValueChange={updateRememberMe.bind(
        null,
        updateDeviceProps,
        updateTransientProps
      )}
    />
  </RowView>
);

const updateRememberMe = (
  updateDeviceProps,
  updateTransientProps,
  rememberMe
) => {
  if (!rememberMe) {
    updateTransientProps({
      password: '',
      email: ''
    });
    focusEmail();
    EncryptedStorage.remove('userCredentials');
  }
  updateDeviceProps({ rememberMe });
};

const updateTransient = (updateTransientProps, prop, value) => {
  const update = {};
  update[`${prop}`] = value;
  updateTransientProps(update);
};

const Home = props => {
  const {
    biometrics,
    biometricLogin,
    email,
    emailErrorMessage,
    emailHasError,
    jiggleForm,
    login,
    navigation,
    network,
    password,
    processing,
    rememberMe,
    updateDeviceProps,
    updateApplicationProps,
    updateTransientProps
  } = props;

  let hasSmallHeight =
    deviceFrame().height - minimumKeyboardHeight < minimumRequiredHeight;
  const [animatedValue] = useState(new Animated.Value(0));
  const [bioSandE, setbioSandE] = useState(
    biometrics.supported && biometrics.enrolled && biometrics.active
  );

  const disabledLogin =
    processing ||
    emailHasError ||
    email.length === 0 ||
    password.length === 0 ||
    network.status === 2;

  useEffect(() => {
    if (jiggleForm) {
      jiggleAnimation(
        animatedValue,
        updateTransient(updateTransientProps, 'jiggleForm', false)
      );
      Vibration.vibrate();
      focusEmail();
    }

    const blurListener = navigation.addListener('blur', reset);
    const focusListener = navigation.addListener(
      'focus',
      rememberMe ? checkRememberMe.bind(null, updateTransientProps) : focusEmail
    );

    const unsubscribe = () => {
      blurListener();
      focusListener();
    };

    return unsubscribe;
  }, [
    animatedValue,
    jiggleForm,
    rememberMe,
    reset,
    updateTransientProps,
    navigation
  ]);

  const reset = useCallback(() => {
    updateApplicationProps({ processing: false });
    Keyboard.dismiss();
  }, [updateApplicationProps]);

  return (
    <SafeAreaView>
      <ColumnView
        flex={1}
        width={'100%'}
        justifyContent={'space-between'}
        alignItems={'stretch'}
        backgroundColor={colors.neutral}
        minHeight={minimumRequiredHeight}
        scrollable>
        {!hasSmallHeight && renderLogo(hasSmallHeight)}
        <ColumnView
          flex={hasSmallHeight ? 2 : 3}
          animated
          animatedStyle={{ left: animatedValue }}
          justifyContent={'center'}
          alignItems={'stretch'}
          minHeight={
            textInputHeight('large') * 2 +
            Text.Button.height +
            Label.height +
            defaults.marginVertical * 2
          }
          marginHorizontal={defaults.marginHorizontal}
          width={'auto'}>
          {!bioSandE && (
            <>
              <TextInput
                autoCapitalize={'none'}
                error={emailHasError}
                errorMessage={emailErrorMessage}
                keyboardType={'email-address'}
                onChangeText={updateTransient.bind(
                  null,
                  updateTransientProps,
                  'email'
                )}
                onSubmitEditing={focusPassword}
                placeholder={I18n.t('input:placeholder.email')}
                ref={emailReference}
                returnKeyType={'next'}
                value={email}
                testID={'home-email-input'}
              />
              <TextInput
                autoCapitalize={'none'}
                keyboardType={'default'}
                onChangeText={updateTransient.bind(
                  null,
                  updateTransientProps,
                  'password'
                )}
                onSubmitEditing={disabledLogin ? mock : login}
                placeholder={I18n.t('input:placeholder.password')}
                ref={passwordReference}
                returnKeyType={'go'}
                secureTextEntry
                value={password}
                testID={'home-password-input'}
              />
              <Button.Primary
                title={I18n.t('general:login')}
                onPress={login.bind(null, false)}
                processing={processing}
                disabled={disabledLogin}
                testID={'home-login-btn'}
              />
              {biometrics.supported && biometrics.enrolled
                ? renderBiometrics({
                    biometrics,
                    biometricLogin,
                    processing,
                    disabledLogin
                  })
                : renderRememberMe({
                    rememberMe,
                    updateDeviceProps,
                    updateTransientProps
                  })}
            </>
          )}

          {bioSandE && (
            <>
              <Button.Primary
                leftIcon={
                  <Icon
                    name={'fingerprint'}
                    color={colors.white}
                    size={40}
                    containerSize={40}
                    disabled
                  />
                }
                textFlex={0}
                title={I18n.t('screens:home.biometrics.login')}
                onPress={biometricLogin}
                processing={processing}
                disabled={!rememberMe}
              />
              <RowView marginVertical={defaults.marginVertical / 2}>
                <Text.Label align={'center'} color={colors.inputDark}>
                  {I18n.t('general:or')}
                </Text.Label>
              </RowView>
              <Button.Secondary
                title={I18n.t('screens:home.standard.login')}
                onPress={setbioSandE.bind(null, !bioSandE)}
              />
            </>
          )}

          {[1, 2].includes(network.status) && (
            <RowView marginTop={defaults.marginVertical / 2}>
              <Label text={I18n.t('general:offline')} />
            </RowView>
          )}
        </ColumnView>

        {hasSmallHeight &&
          ((biometrics.supported && bioSandE) || !biometrics.supported) &&
          renderLogo(hasSmallHeight)}
        <RowView
          flex={hasSmallHeight ? 0 : 1}
          justifyContent={'center'}
          alignItems={'flex-end'}
          height={Text.Caption.height + defaults.marginVertical / 4}
          marginVertical={defaults.marginVertical / 4}>
          <Text.Caption textAlign={'center'} color={colors.secondary}>
            {appVersionString()}
          </Text.Caption>
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

Home.defaultProps = {
  emailHasError: false,
  email: '',
  jiggleForm: false,
  password: ''
};

Home.propTypes = {
  biometrics: PropTypes.object,
  biometricLogin: PropTypes.func,
  email: PropTypes.string,
  emailHasError: PropTypes.bool,
  emailErrorMessage: PropTypes.string,
  jiggleForm: PropTypes.bool,
  login: PropTypes.func,
  navigation: PropTypes.func,
  network: PropTypes.object,
  password: PropTypes.string,
  processing: PropTypes.bool,
  rememberMe: PropTypes.bool,
  updateDeviceProps: PropTypes.func,
  updateApplicationProps: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default Home;
