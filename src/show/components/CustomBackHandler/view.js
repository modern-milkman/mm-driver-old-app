import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { InteractionManager } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks';

import { defaultRoutes, mock } from 'Helpers';
import NavigationService from 'Navigation/service';

const customBackHandlerCallback = ({
  internallyDisabled,
  lastRoute,
  sideBarOpen,
  toggleModal,
  updateProps
}) => {
  if (!internallyDisabled.current) {
    internallyDisabled.current = true;
    switch (lastRoute) {
      case 'Home':
        internallyDisabled.current = false;
        return false;

      case 'Main':
        if (sideBarOpen) {
          updateProps({ sideBarOpen: false });
        }
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

const CustomBackHandler = ({
  lastRoute,
  sideBarOpen,
  toggleModal,
  updateProps
}) => {
  const internallyDisabled = useRef(false);
  useBackHandler(
    customBackHandlerCallback.bind(null, {
      internallyDisabled,
      lastRoute,
      sideBarOpen,
      toggleModal,
      updateProps
    })
  );

  return null;
};

CustomBackHandler.propTypes = {
  lastRoute: PropTypes.string,
  sideBarOpen: PropTypes.bool,
  toggleModal: PropTypes.func,
  updateProps: PropTypes.func
};

CustomBackHandler.defaultProps = {
  lastRoute: defaultRoutes.public,
  sideBarOpen: false,
  toggleModal: mock,
  updateProps: mock
};

const areEqual = (prevProps, nextProps) => {
  return !(
    prevProps.sideBarOpen !== nextProps.sideBarOpen ||
    prevProps.lastRoute !== nextProps.lastRoute
  );
};

export default React.memo(CustomBackHandler, areEqual);
