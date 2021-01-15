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
import NavigationService from 'Navigation/service';
import { ColumnView, FullView } from 'Containers';
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
      hasError: false,
      reloading: false
    };
  }

  static getDerivedStateFromError = (error) => ({
    hasError: true
  });

  componentDidCatch = (error, info) => {
    const { device, dispatch, sendCrashLog, user } = this.props;
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
        ref={(nav) => {
          this.navigator = nav;
        }}
      />

      <SideBar />
    </FullView>
  );

  renderCrash = () => {
    const { reloading } = this.state;
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
            <Button.Tertiary
              title={I18n.t('general:restart')}
              onPress={restartApp}
            />
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
          <Button.Primary
            title={I18n.t('general:reset')}
            onPress={this.resetAndReload}
            processing={reloading}
            disabled={reloading}
          />
          <Text.Caption textAlign={'center'} color={colors.white}>
            {`V: ${Config.APP_VERSION_NAME}`}
          </Text.Caption>
        </ColumnView>
      </FullView>
    );
  };

  resetAndReload = () => {
    const { dispatch } = this.props;
    this.setState({ reloading: true });
    dispatch({
      type: ApplicationTypes.LOGOUT
    });
    setTimeout(RNRestart.Restart, 1000);
  };
}

Root.propTypes = {
  device: PropTypes.object,
  dispatch: PropTypes.func,
  sendCrashLog: PropTypes.func,
  user: PropTypes.object
};

const mapStateToProps = (state) => ({
  device: state.device,
  user: state.user
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  sendCrashLog: applicationActions.sendCrashLog
});

export default connect(mapStateToProps, mapDispatchToProps)(Root);
