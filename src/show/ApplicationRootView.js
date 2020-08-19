import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BackHandler, NativeModules, Platform, StatusBar } from 'react-native';

import { colors } from 'Theme';
import Navigator from 'Navigation/Navigator';
import NavigationService from 'Navigation/service';
import { FullView, SafeAreaView } from 'Containers';
import { ActionSheetAndroid, SideBar } from 'Components';

const fullFlex = { flex: 1 };
const { StatusBarManager } = NativeModules;
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

  render = () => {
    return (
      <FullView>
        <StatusBar
          translucent
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />
        {Platform.OS === 'android' && <ActionSheetAndroid />}
        {/* content that should go on top of the app, full view, no safe area bounds */}

        {/* content that should go within the safe area bounds of a device's view */}
        <SafeAreaView
          top={this.shouldHaveTopInset()}
          bottom={this.shouldHaveBottomInset()}
          style={[
            fullFlex,
            { paddingTop: this.statusBarHeightPadding() },
            { backgroundColor: colors.standard }
          ]}>
          <Navigator
            ref={(nav) => {
              this.navigator = nav;
            }}
          />
        </SafeAreaView>

        <SideBar
          top={this.shouldHaveTopInset(true)}
          bottom={this.shouldHaveBottomInset(true)}
        />
      </FullView>
    );
  };

  statusBarHeightPadding = () => {
    const paddingTop = Platform.OS === 'ios' ? 0 : StatusBarManager.HEIGHT;

    const { application } = this.props;
    const lastRoute = application.stackRoute[application.stackRoute.length - 1];
    return ['UpgradeApp', 'Home'].includes(lastRoute) ? paddingTop : 0;
  };

  shouldHaveBottomInset = (isSidebar = false) => {
    const { application } = this.props;
    const lastRoute = application.stackRoute[application.stackRoute.length - 1];
    return ['Home', isSidebar ? 'Main' : '', 'UpgradeApp'].includes(lastRoute);
  };

  shouldHaveTopInset = (isSidebar = false) => {
    const { application } = this.props;
    const lastRoute = application.stackRoute[application.stackRoute.length - 1];
    return ['Home', isSidebar ? 'Main' : '', 'UpgradeApp'].includes(lastRoute);
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
