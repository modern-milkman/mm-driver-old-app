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
    const { growl } = this.props;
    return (
      <DropdownAlert
        ref={(ref) => (this.dropdown = ref)}
        tapToCloseEnabled
        panResponderEnabled
        translucent
        zIndex={100}
        closeInterval={parseInt(Config.GROWL_AUTOHIDE)}
        infoColor={colors.primary}
        errorColor={colors.error}
        titleStyle={StyleSheet.flatten([
          style.titleStyle,
          growl.type === 'error' && style.error
        ])}
        messageStyle={StyleSheet.flatten([
          style.messageStyle,
          growl.type === 'error' && style.error
        ])}
        defaultContainer={style.defaultContainer}
        contentContainerStyle={style.contentContainerStyle}
        defaultTextContainer={style.defaultTextContainer}
        wrapperStyle={style.shadow}
        imageStyle={style.logo}
        infoImageSrc={null}
        errorImageSrc={null}
        inactiveStatusBarBackgroundColor={'transparent'}
        onTap={this.onTap}
        updateStatusBar={false}
      />
    );
  };
}

Growl.propTypes = {
  growl: PropTypes.object,
  updateProps: PropTypes.func.isRequired
};

export default Growl;
