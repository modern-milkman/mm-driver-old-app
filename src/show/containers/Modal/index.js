import React from 'react';
import PropTypes from 'prop-types';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Modal as RNModal, KeyboardAvoidingView } from 'react-native';

import { useThemedStyles } from 'Containers';

import unthemedStyle from './style';

const Modal = props => {
  const style = useThemedStyles(unthemedStyle);

  const {
    animationType,
    children,
    onDismiss,
    onRequestClose,
    onShow,
    transparent,
    visible
  } = props;

  return (
    <RNModal
      animationType={animationType}
      transparent={transparent}
      visible={visible}
      onShow={onShow}
      onDismiss={onDismiss}
      onRequestClose={onRequestClose}
      statusBarTranslucent={true}>
      <SafeAreaProvider>
        <KeyboardAvoidingView
          behavior={'padding'}
          enabled
          style={style.sawrapper}>
          {children}
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </RNModal>
  );
};

Modal.propTypes = {
  animationType: PropTypes.string,
  children: PropTypes.object.isRequired,
  onDismiss: PropTypes.func,
  onRequestClose: PropTypes.func,
  onShow: PropTypes.func,
  transparent: PropTypes.bool,
  visible: PropTypes.bool.isRequired
};

Modal.defaultProps = {
  animationType: 'slide',
  children: {},
  onDismiss: () => {},
  onRequestClose: () => {},
  onShow: () => {},
  transparent: false,
  visible: false
};

export default Modal;
