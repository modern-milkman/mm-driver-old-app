import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Config from 'react-native-config';
import RNRestart from 'react-native-restart';
import { Platform, StatusBar } from 'react-native';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import { CarLogoFlatTire } from 'Images';
import Navigator from 'Navigation/Navigator';
import { ColumnView, FullView } from 'Containers';
import NavigationService from 'Navigation/service';
import { Types as DeviceTypes } from 'Reducers/device';
import {
  Creators as applicationActions,
  Types as ApplicationTypes
} from 'Reducers/application';

import {
  ActionSheetAndroid,
  Button,
  CustomBackHandler,
  Growl,
  SideBar,
  Text
} from 'Components';

const restartApp = () => {
  RNRestart.Restart();
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
    dispatch({
      type: DeviceTypes.UPDATE_PROPS,
      props: { crashCount: crashCount + 1 }
    });
    if (JSON.parse(Config.SEND_SLACK_CRASHLOGS)) {
      dispatch(sendCrashLog({ device, error, info, user }));
    }
  };

  componentDidMount = () => {
    const { dispatch } = this.props;

    NavigationService.setNavigator(this.navigator, dispatch);
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
      {Platform.OS === 'android' && <CustomBackHandler />}
      {/* content that should go on top of the app, full view, no safe area bounds */}

      <Navigator
        ref={nav => {
          this.navigator = nav;
        }}
      />

      <SideBar />
    </FullView>
  );

  renderCrash = () => {
    const {
      device: {
        crashCount,
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
          <ColumnView marginTop={24} width={'auto'} marginHorizontal={24}>
            <Text.List color={colors.white} align={'center'}>
              {I18n.t('screens:appCrash.description')}
            </Text.List>
          </ColumnView>
          <ColumnView marginTop={24} width={'auto'} marginHorizontal={24}>
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
            {`V: ${Config.APP_VERSION_NAME}`}
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
