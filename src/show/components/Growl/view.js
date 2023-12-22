//testID supported
import store from 'Redux/store';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import React, { createRef, useEffect } from 'react';
import DropdownAlert from 'react-native-dropdownalert';

import { useThemedStyles } from 'Containers';

import unthemedStyle from './style';

const dropdown = createRef();

const setDropdownReference = func => {
  dropdown.current = func;
};

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
      dropdownAlertInstance: dropdown.current
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
      alert={setDropdownReference.bind(null)}
      animatedViewStyle={style.shadow}
      defaultContainer={style.defaultContainer}
      errorColor={colors.error}
      errorImageSrc={null}
      imageStyle={style.logo}
      inactiveStatusBarBackgroundColor={'transparent'}
      infoColor={colors.primary}
      infoImageSrc={null}
      messageNumberOfLines={5}
      messageTextStyle={StyleSheet.flatten([
        style.messageStyle,
        growl.type === 'error' && style.error
      ])}
      onDismissPress={onTap}
      panResponderEnabled
      safeViewStyle={style.contentContainerStyle}
      testID={testID}
      textViewStyle={style.defaultTextContainer}
      titleNumberOfLines={2}
      titleTextStyle={StyleSheet.flatten([
        style.titleStyle,
        growl.type === 'error' && style.error
      ])}
      translucent
      updateStatusBar={false}
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
