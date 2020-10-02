import PropTypes from 'prop-types';
import { BackHandler } from 'react-native';
import { useCallback, useEffect } from 'react';

import { defaultRoutes, mock } from 'Helpers';
import NavigationService from 'Navigation/service';

const CustomBackHandler = ({ lastRoute, sideBarOpen, updateProps }) => {
  const backAction = useCallback(() => {
    switch (lastRoute) {
      case 'Home':
        return false;

      case 'Main':
        if (sideBarOpen) {
          updateProps({ sideBarOpen: false });
        }
        return true;
    }
    NavigationService.goBack();
    return true;
  }, [lastRoute, sideBarOpen, updateProps]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [backAction]);

  return null;
};

CustomBackHandler.propTypes = {
  lastRoute: PropTypes.string,
  sideBarOpen: PropTypes.bool,
  updateProps: PropTypes.func
};

CustomBackHandler.defaultProps = {
  lastRoute: defaultRoutes.public,
  sideBarOpen: false,
  updateProps: mock
};

export default CustomBackHandler;
