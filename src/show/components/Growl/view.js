//testID supported
import store from 'Redux/store';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { StyleSheet } from 'react-native';
import React, { createRef, useEffect } from 'react';
import DropdownAlert from 'react-native-dropdownalert';

import { useThemedStyles } from 'Containers';

import unthemedStyle from './style';

const dropdown = createRef();

const Growl = props => {
  const style = useThemedStyles(unthemedStyle);
  const {
    growl,
    theme: { colors },
    testID,
    updateProps
  } = props;

  useEffect(() => {
    updateProps({
      dropdownAlertInstance: dropdown.current.alertWithType
    });

    return () => {
      updateProps({ dropdownAlertInstance: null });
    };
  }, [updateProps]);

  const onTap = ({ payload }) => {
    const { onTap: propOnTap = null, action = null, ...rest } = payload;
    if (action) {
      const { dispatch } = store().store;
      dispatch({ type: action, ...rest });
    } else if (propOnTap) {
      propOnTap();
    }
  };

  return (
    <DropdownAlert
      ref={dropdown}
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
      onTap={onTap}
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

Growl.propTypes = {
  growl: PropTypes.object,
  testID: PropTypes.string,
  theme: PropTypes.object,
  updateProps: PropTypes.func.isRequired
};

export default Growl;
