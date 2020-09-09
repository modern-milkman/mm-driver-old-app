import React from 'react';
import PropTypes from 'prop-types';
import { Modal as RNModal } from 'react-native';

import SafeAreaView from 'Containers/SafeAreaView';

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
      onRequestClose={onRequestClose}>
      <SafeAreaView
        keyboardSafe
        style={style.sawrapper}
        keyboardSafeStyle={[style.flex]}>
        {children}
      </SafeAreaView>
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
