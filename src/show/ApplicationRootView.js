import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Platform, StatusBar } from 'react-native';

import { FullView } from 'Containers';
import Navigator from 'Navigation/Navigator';
import NavigationService from 'Navigation/service';
import { ActionSheetAndroid, CustomBackHandler, SideBar } from 'Components';
import { Types as ApplicationTypes } from 'Reducers/application';

class Root extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    const { dispatch } = this.props;

    NavigationService.setNavigator(this.navigator, dispatch);
    dispatch({ type: ApplicationTypes.MOUNTED });
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
  };
}

Root.propTypes = {
  dispatch: PropTypes.func
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(Root);
