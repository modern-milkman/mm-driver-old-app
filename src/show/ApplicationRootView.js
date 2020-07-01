import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BackHandler, NativeModules, Platform, StatusBar } from 'react-native';

import Navigator from '/process/navigation/Navigator';
import NavigationService from '/process/navigation/service';

import { colors } from '/show/resources/theme';
import { ActionSheetAndroid } from '/show/components';
import { FullView, SafeAreaView } from '/show/containers';

const fullFlex = { flex: 1 };
const { StatusBarManager } = NativeModules;
const statusBarHeightPadding = {
  paddingTop: Platform.OS === 'ios' ? 0 : StatusBarManager.HEIGHT
};

const handleBackPress = () => true;

class Root extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    NavigationService.setNavigator(this.navigator, dispatch);
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
  };

  render = () => (
    <FullView>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle={'light-content'}
      />
      {Platform.OS === 'android' && <ActionSheetAndroid />}
      {/* content that should go on top of the app, full view, no safe area bounds */}

      {/* content that should go within the safe area bounds of a device's view */}
      <SafeAreaView
        top={this.shouldHaveTopInset()}
        bottom={this.shouldHaveBottomInset()}
        style={[
          fullFlex,
          statusBarHeightPadding,
          { backgroundColor: colors.primary }
        ]}>
        <Navigator
          ref={(nav) => {
            this.navigator = nav;
          }}
        />
      </SafeAreaView>
    </FullView>
  );

  shouldHaveBottomInset = () => {
    const { application } = this.props;
    const lastRoute = application.stackRoute[application.stackRoute.length - 1];
    return ['UpgradeApp', 'Home'].includes(lastRoute);
  };

  shouldHaveTopInset = () => {
    const { application } = this.props;
    const lastRoute = application.stackRoute[application.stackRoute.length - 1];
    return ['UpgradeApp', 'Home'].includes(lastRoute);
  };
}

Root.propTypes = {
  application: PropTypes.object,
  dispatch: PropTypes.func
};

const mapStateToProps = (state) => ({
  application: { ...state.application }
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(Root);
