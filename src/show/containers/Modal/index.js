import React from 'react';
import PropTypes from 'prop-types';
import { Modal as RNModal } from 'react-native';

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
      {children}
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
