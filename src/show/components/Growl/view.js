//testID supported
import React from 'react';
import store from 'Redux/store';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { StyleSheet } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';

import { colors } from 'Theme';

import style from './style';

class Growl extends React.Component {
  componentDidMount = () => {
    const { updateProps } = this.props;
    updateProps({
      dropdownAlertInstance: this.dropdown.alertWithType.bind(this)
    });
  };

  componentWillUnmount = () => {
    const { updateProps } = this.props;
    updateProps({ dropdownAlertInstance: null });
  };

  onTap = ({ payload }) => {
    const { onTap = null, action = null, ...rest } = payload;
    if (action) {
      const { dispatch } = store().store;
      dispatch({ type: action, ...rest });
    } else if (onTap) {
      onTap();
    }
  };

  render = () => {
    const { growl, testID } = this.props;
    return (
      <DropdownAlert
        ref={ref => (this.dropdown = ref)}
        closeInterval={parseInt(Config.GROWL_AUTOHIDE)}
        contentContainerStyle={style.contentContainerStyle}
        defaultContainer={style.defaultContainer}
        defaultTextContainer={style.defaultTextContainer}
        errorColor={colors.error}
        errorImageSrc={null}
        imageStyle={style.logo}
        inactiveStatusBarBackgroundColor={'transparent'}
        infoColor={colors.primary}
        infoImageSrc={null}
        messageNumOfLines={5}
        messageStyle={StyleSheet.flatten([
          style.messageStyle,
          growl.type === 'error' && style.error
        ])}
        onTap={this.onTap}
        panResponderEnabled
        tapToCloseEnabled
        testID={testID}
        titleNumOfLines={2}
        titleStyle={StyleSheet.flatten([
          style.titleStyle,
          growl.type === 'error' && style.error
        ])}
        translucent
        updateStatusBar={false}
        wrapperStyle={style.shadow}
        zIndex={100}
      />
    );
  };
}

Growl.propTypes = {
  growl: PropTypes.object,
  testID: PropTypes.string,
  updateProps: PropTypes.func.isRequired
};

export default Growl;
