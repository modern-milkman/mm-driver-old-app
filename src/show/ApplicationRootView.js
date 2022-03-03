import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Config from 'react-native-config';
import RNRestart from 'react-native-restart';
import { Platform, StatusBar } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import I18n from 'Locales/I18n';
import Navigator from 'Navigator';
import Alert from 'Services/alert';
import { colors, defaults } from 'Theme';
import { CarLogoFlatTire } from 'Images';
import { ColumnView, FullView } from 'Containers';
import NavigationService from 'Services/navigation';
import { Types as DeviceTypes } from 'Reducers/device';
import { appVersionString, formatDateTime } from 'Helpers';
import {
  Creators as applicationActions,
  Types as ApplicationTypes
} from 'Reducers/application';
import {
  ActionSheetAndroid,
  Button,
  Growl,
  InAppBrowser,
  Text
} from 'Components';

const restartApp = () => {
  RNRestart.Restart();
};

const sendToClipboard = ({ crashCode }) => {
  Clipboard.setString(crashCode);
  Alert({
    title: I18n.t('alert:clipboard.title'),
    message: I18n.t('alert:clipboard.description'),
    buttons: [
      {
        text: I18n.t('general:ok'),
        style: 'cancel'
      }
    ]
  });
};

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError = error => ({
    hasError: true
  });

  componentDidCatch = (error, info) => {
    const { device, dispatch, sendCrashLog, user } = this.props;
    const { crashCount } = device;
    const props = {
      crashCount: crashCount + 1,
      crashCode: `${device.uniqueID}.${formatDateTime(new Date())}`
    };
    dispatch({
      type: DeviceTypes.UPDATE_PROPS,
      props
    });
    if (JSON.parse(Config.SEND_SLACK_CRASHLOGS)) {
      dispatch(
        sendCrashLog({
          device: {
            ...device,
            ...props
          },
          error,
          user
        })
      );
    }
  };

  componentDidMount = () => {
    const { dispatch } = this.props;

    NavigationService.setNavigator(dispatch);
    dispatch({ type: ApplicationTypes.MOUNTED });
  };

  render = () => {
    const { hasError } = this.state;
    return hasError ? this.renderCrash() : this.renderApp();
  };

  renderApp = () => (
    <FullView>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
      />
      <Growl />
      {Platform.OS === 'android' && <ActionSheetAndroid />}
      <InAppBrowser />

      {/* content that should go on top of the app, full view, no safe area bounds */}

      <Navigator />
    </FullView>
  );

  renderCrash = () => {
    const {
      device: {
        crashCount,
        crashCode,
        processors: { reloadingDevice }
      },
      dispatch,
      resetAndReload
    } = this.props;
    return (
      <FullView bgColor={colors.primary}>
        <ColumnView flex={1} justifyContent={'center'}>
          <CarLogoFlatTire
            width={200}
            disabled
            fill={colors.white}
            primaryFill={colors.primary}
          />
          <ColumnView height={Text.Heading.height}>
            <Text.Heading color={colors.white}>
              {I18n.t('screens:appCrash.title')}
            </Text.Heading>
          </ColumnView>
          <ColumnView
            marginTop={defaults.marginVertical}
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}>
            <Text.List color={colors.white} align={'center'}>
              {I18n.t('screens:appCrash.description')}
            </Text.List>
          </ColumnView>
          <ColumnView
            marginTop={defaults.marginVertical}
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}>
            <Text.Caption
              color={colors.white}
              align={'center'}
              onPress={sendToClipboard.bind(null, { crashCode })}>
              {I18n.t('screens:appCrash.crashCode', { crashCode })}
            </Text.Caption>
          </ColumnView>
          <ColumnView
            marginTop={defaults.marginVertical}
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}>
            {crashCount <= 1 && (
              <Button.Tertiary
                title={I18n.t('general:restart')}
                onPress={restartApp}
              />
            )}
            {crashCount > 1 && (
              <Button.Tertiary
                title={I18n.t('general:reset')}
                processing={reloadingDevice}
                disabled={reloadingDevice}
                onPress={dispatch.bind(null, resetAndReload())}
              />
            )}
          </ColumnView>
        </ColumnView>
        <ColumnView
          justifyContent={'center'}
          alignItems={'center'}
          height={
            Text.Caption.height +
            Text.Button.height +
            defaults.marginVertical / 4
          }
          marginVertical={defaults.marginVertical}>
          {crashCount <= 1 && (
            <Button.Primary
              title={I18n.t('general:reset')}
              onPress={dispatch.bind(null, resetAndReload())}
              processing={reloadingDevice}
              disabled={reloadingDevice}
            />
          )}
          <Text.Caption textAlign={'center'} color={colors.white}>
            {appVersionString()}
          </Text.Caption>
        </ColumnView>
      </FullView>
    );
  };
}

Root.propTypes = {
  device: PropTypes.object,
  dispatch: PropTypes.func,
  resetAndReload: PropTypes.func,
  sendCrashLog: PropTypes.func,
  user: PropTypes.object
};

const mapStateToProps = state => ({
  device: state.device,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  sendCrashLog: applicationActions.sendCrashLog,
  resetAndReload: applicationActions.resetAndReload
});

export default connect(mapStateToProps, mapDispatchToProps)(Root);
