import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { InteractionManager } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks';

import { defaultRoutes, mock } from 'Helpers';
import NavigationService from 'Services/navigation';

const customBackHandlerCallback = ({
  internallyDisabled,
  lastRoute,
  toggleModal
}) => {
  if (!internallyDisabled.current) {
    internallyDisabled.current = true;
    switch (lastRoute) {
      case 'Home':
        internallyDisabled.current = false;
        return false;

      case 'Main':
        internallyDisabled.current = false;
        return true;
      case 'CustomerIssueModal':
        toggleModal('showClaimModal', false);
        toggleModal('showReplyModal', false);
        InteractionManager.runAfterInteractions(() => {
          internallyDisabled.current = false;
        });
        NavigationService.goBack();
        return true;
      default:
        InteractionManager.runAfterInteractions(() => {
          internallyDisabled.current = false;
        });
        NavigationService.goBack();
        return true;
    }
  } else {
    return true;
  }
};

const CustomBackHandler = ({ lastRoute, toggleModal }) => {
  const internallyDisabled = useRef(false);
  useBackHandler(
    customBackHandlerCallback.bind(null, {
      internallyDisabled,
      lastRoute,
      toggleModal
    })
  );

  return null;
};

CustomBackHandler.propTypes = {
  lastRoute: PropTypes.string,
  toggleModal: PropTypes.func
};

CustomBackHandler.defaultProps = {
  lastRoute: defaultRoutes.public,
  toggleModal: mock
};

const areEqual = (prevProps, nextProps) => {
  return !(prevProps.lastRoute !== nextProps.lastRoute);
};

export default React.memo(CustomBackHandler, areEqual);
