import React from 'react';
import PropTypes from 'prop-types';
import { Modal as RNModal } from 'react-native';

const Modal = (props) => {
  const {
    children,
    onDismiss,
    onRequestClose,
    onShow,
    transparent,
    visible
  } = props;
  return (
    <RNModal
      animationType="slide"
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
  children: PropTypes.object.isRequired,
  onDismiss: PropTypes.func,
  onRequestClose: PropTypes.func,
  onShow: PropTypes.func,
  transparent: PropTypes.bool,
  visible: PropTypes.bool.isRequired
};

Modal.defaultProps = {
  children: {},
  onDismiss: () => {},
  onRequestClose: () => {},
  onShow: () => {},
  transparent: false,
  visible: false
};

export default Modal;
