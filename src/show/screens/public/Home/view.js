import PropTypes from 'prop-types';
import { Animated, Keyboard, Pressable } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';

import { Logo } from 'Images';
import I18n from 'Locales/I18n';
import { defaults } from 'Theme';
import Vibration from 'Services/vibration';
import EncryptedStorage from 'Services/encryptedStorage';
import { Button, Icon, Label, Switch, Text } from 'Components';
import { ColumnView, RowView, SafeAreaView, useTheme } from 'Containers';
import TextInput, { height as textInputHeight } from 'Components/TextInput';
import {
  actionSheetSwitch,
  appVersionString,
  availableCountries,
  jiggleAnimation,
  mock,
  deviceFrame
} from 'Helpers';

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
  defaults.topNavigation.height +
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
  colors,
  processing,
  disabledLogin
}) => (
  <>
    <RowView marginVertical={defaults.marginVertical / 2}>
      <Text.Label align={'center'} color={colors.inputSecondary}>
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

const renderCountrySelector = ({ colors, country, setCountry }) => (
  <Pressable
    onPress={actionSheetSwitch.bind(null, {
      label: 'countries',
      list: availableCountries,
      method: setCountry
    })}>
    <RowView
      justifyContent={'space-between'}
      height={defaults.topNavigation.height}
      marginVertical={defaults.marginVertical / 2}>
      <Text.Tab color={colors.inputSecondary}>
        {I18n.t('general:country')}
      </Text.Tab>
      <Label
        backgroundColor={colors.inputSecondary}
        text={I18n.t(`countries:${country}`)}
      />
    </RowView>
  </Pressable>
);

const renderLogo = hasSmallHeight => (
  <ColumnView
    flex={hasSmallHeight ? 0 : 2}
    width={'100%'}
    justifyContent={'center'}
    alignItems={'center'}
    height={logoSize / (82 / 56) + Text.Heading.height}>
    <Logo width={logoSize} />
  </ColumnView>
);

const renderRememberMe = ({
  colors,
  rememberMe,
  updateDeviceProps,
  updateTransientProps
}) => (
  <RowView
    justifyContent={'space-between'}
    width={'auto'}
    marginVertical={defaults.marginVertical}>
    <Text.Tab color={colors.inputSecondary}>
      {I18n.t('screens:home.rememberMe')}
    </Text.Tab>
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

const deviceFrameHeight = deviceFrame().height;

const Home = props => {
  const {
    biometrics,
    biometricLogin,
    country,
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
    setCountry,
    updateDeviceProps,
    updateApplicationProps,
    updateTransientProps
  } = props;
  const { colors } = useTheme();

  let hasSmallHeight =
    deviceFrameHeight - minimumKeyboardHeight < minimumRequiredHeight;
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
                    colors,
                    processing,
                    disabledLogin
                  })
                : renderRememberMe({
                    colors,
                    rememberMe,
                    updateDeviceProps,
                    updateTransientProps
                  })}
              {renderCountrySelector({ colors, country, setCountry })}
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
                disabled={!rememberMe || disabledLogin}
              />
              <RowView marginVertical={defaults.marginVertical / 2}>
                <Text.Label align={'center'} color={colors.inputSecondary}>
                  {I18n.t('general:or')}
                </Text.Label>
              </RowView>
              <Button.Secondary
                title={I18n.t('screens:home.standard.login')}
                onPress={setbioSandE.bind(null, !bioSandE)}
              />
              {renderCountrySelector({ colors, country, setCountry })}
            </>
          )}

          {network.status === 2 && (
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
          <Text.Caption textAlign={'center'} color={colors.inputSecondary}>
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
  country: PropTypes.string,
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
  setCountry: PropTypes.func,
  updateDeviceProps: PropTypes.func,
  updateApplicationProps: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default Home;
