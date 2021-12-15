import { InteractionManager } from 'react-native';

import { Types as ApplicationTypes } from 'Reducers/application';

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
const config = {
  goBackDisabled: false
};

const NavigationService = {
  goBack: props => {
    if (!config.goBackDisabled) {
      config.goBackDisabled = true;
      if (navigationRef.isReady()) {
        if (props?.beforeCallback) {
          props.beforeCallback();
        }
        navigationRef.goBack();
        config.storeDispatcher({
          type: ApplicationTypes.NAVIGATE_BACK
        });
        config.storeDispatcher({
          type: ApplicationTypes.REMOVE_LAST_STACK_ROUTE
        });
        InteractionManager.runAfterInteractions(() => {
          config.goBackDisabled = false;
        });
        if (props?.afterCallback) {
          props.afterCallback();
        }
      } else {
        config.goBackDisabled = false;
      }
    }
  },
  setNavigator: storeDispatcher => {
    if (storeDispatcher) {
      config.storeDispatcher = storeDispatcher;
    }
  },
  navigate: navigationParams => {
    const { routeName, params, action = [], key = '' } = navigationParams;
    if (navigationRef.isReady() && routeName) {
      navigationRef.navigate(routeName, params);

      if (config.storeDispatcher) {
        config.storeDispatcher({
          type: ApplicationTypes.NAVIGATE,
          routeName,
          params,
          action,
          key
        });
      }
    }
  }
};

export default NavigationService;
