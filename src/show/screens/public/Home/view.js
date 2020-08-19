import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import Config from 'react-native-config';
import { NavigationEvents } from 'react-navigation';

import I18n from 'Locales/I18n';
import { jiggleAnimation, randomKey } from 'Helpers';
import Vibration from 'Services/vibration';

import { colors } from 'Theme';
import { Button, Text, TextInput } from 'Components';
import { CarLogo } from 'Images';
import { ColumnView, RowView, SafeAreaView } from 'Containers';

import style from './style';

let emailReference = null;

class Home extends React.Component {
  constructor() {
    super();
    this.animatedValue = new Animated.Value(0);
    this.state = {
      refreshKey: randomKey()
    };
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

  refreshKey = () => {
    this.setState({ refreshKey: randomKey() });
  };

  render = () => {
    const { refreshKey } = this.state;
    const { email, emailHasError, login, password, processing } = this.props;

    return (
      <SafeAreaView top={true} bottom={true} style={style.screenWrapper}>
        <NavigationEvents onWillFocus={this.refreshKey} />
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
            <CarLogo width={100} />
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
              refreshKey={refreshKey}
            />
            <TextInput
              onChangeText={this.updateTransient.bind(null, 'password')}
              value={password}
              keyboardType={'default'}
              autoCapitalize={'none'}
              returnKeyType={'done'}
              secureTextEntry
              placeholder={I18n.t('input:placeholder.password')}
              refreshKey={refreshKey}
            />
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
          </ColumnView>
          <RowView>
            <Text.Caption textAlign={'center'} color={colors.black}>
              {`V: ${Config.APP_VERSION_NAME}`}
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
