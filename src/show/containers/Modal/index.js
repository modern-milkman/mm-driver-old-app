import React from 'react';
import PropTypes from 'prop-types';
import { Modal as RNModal, KeyboardAvoidingView } from 'react-native';

import style from './style';

const Modal = (props) => {
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
      <KeyboardAvoidingView
        behavior={'padding'}
        enabled
        style={style.sawrapper}>
        {children}
      </KeyboardAvoidingView>
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
