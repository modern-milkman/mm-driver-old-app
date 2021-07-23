import PropTypes from 'prop-types';
import { useBackHandler } from '@react-native-community/hooks';

import { defaultRoutes, mock } from 'Helpers';
import NavigationService from 'Navigation/service';

const CustomBackHandler = ({ lastRoute, sideBarOpen, updateProps }) => {
  useBackHandler(() => {
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
  });

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
