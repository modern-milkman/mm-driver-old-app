import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import Config from 'react-native-config';
import { SharedElement } from 'react-navigation-shared-element';

import I18n from 'Locales/I18n';
import { jiggleAnimation } from 'Helpers';
import Vibration from 'Services/vibration';

import { colors } from 'Resources/theme';
import { Button, Text, TextInput } from 'Components';
import { CarLogo } from 'Resources/images';
import { ColumnView, RowView, SafeAreaView } from 'Containers';

import style from './style';

let emailReference = null;

class Home extends React.Component {
  constructor() {
    super();
    this.animatedValue = new Animated.Value(0);
  }

  componentDidUpdate() {
    const { jiggleForm } = this.props;
    if (jiggleForm) {
      jiggleAnimation(
        this.animatedValue,
        this.updateTransient('jiggleForm', false)
      );
      Vibration.vibrate();
      emailReference?.focus();
    }
  }

  updateTransient = (prop, value) => {
    const { updateTransientProps } = this.props;
    const update = {};
    update[`${prop}`] = value;
    updateTransientProps(update);
  };

  render = () => {
    const { email, emailHasError, login, password, processing } = this.props;
    return (
      <SafeAreaView top={true} bottom={true} style={style.screenWrapper}>
        <ColumnView
          width={'100%'}
          flex={1}
          justifyContent={'space-between'}
          alignItems={'stretch'}
          scrollable>
          <ColumnView
            width={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
            flex={1}
            minHeight={103}>
            <SharedElement id="car-transition">
              <CarLogo width={100} />
            </SharedElement>
            <ColumnView>
              <Text.Title textAlign={'center'} color={colors.primary}>
                {I18n.t('screens:home.driverLogin')}
              </Text.Title>
            </ColumnView>
          </ColumnView>
          <ColumnView
            animated
            animatedStyle={{ left: this.animatedValue }}
            flex={2}
            justifyContent={'flex-start'}
            alignItems={'stretch'}
            minHeight={220}>
            <TextInput
              onChangeText={this.updateTransient.bind(null, 'email')}
              onChangeValidation={this.updateTransient.bind(
                null,
                'emailHasError'
              )}
              validations={['email']}
              value={email}
              keyboardType={'email-address'}
              autoCapitalize={'none'}
              returnKeyType={'done'}
              placeholder={I18n.t('input:placeholder.email')}
              ref={(ti) => (emailReference = ti)}
            />
            <TextInput
              onChangeText={this.updateTransient.bind(null, 'password')}
              value={password}
              keyboardType={'default'}
              autoCapitalize={'none'}
              returnKeyType={'done'}
              secureTextEntry
              placeholder={I18n.t('input:placeholder.password')}
            />
            <SharedElement id="loginout-btn-transition">
              <Button.Primary
                title={I18n.t('general:login')}
                onPress={login}
                processing={processing}
                disabled={
                  processing ||
                  emailHasError ||
                  email.length === 0 ||
                  password.length === 0
                }
              />
            </SharedElement>
          </ColumnView>
          <RowView>
            <Text.Caption textAlign={'center'} color={colors.black}>
              {`V: ${Config.APP_VERSION_NAME}-${Config.APP_VERSION_CODE}`}
            </Text.Caption>
          </RowView>
        </ColumnView>
      </SafeAreaView>
    );
  };
}

Home.defaultProps = {
  emailHasError: false,
  email: '',
  jiggleForm: false,
  password: ''
};

Home.propTypes = {
  email: PropTypes.string,
  emailHasError: PropTypes.bool,
  jiggleForm: PropTypes.bool,
  password: PropTypes.string,
  login: PropTypes.func,
  processing: PropTypes.bool,
  updateProps: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default Home;
