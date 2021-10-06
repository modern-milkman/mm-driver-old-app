import { InteractionManager } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';

import { blacklists } from 'Helpers';
import { Types as ApplicationTypes } from 'Reducers/application';

const config = {
  goBackDisabled: false
};

const NavigationService = {
  goBack: props => {
    if (!config.goBackDisabled) {
      config.goBackDisabled = true;
      if (config.navigator) {
        if (props?.beforeCallback) {
          props.beforeCallback();
        }

        config.navigator.dispatch(NavigationActions.back({}));
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
  setNavigator: (nav, storeDispatcher) => {
    if (nav && storeDispatcher) {
      config.navigator = nav;
      config.storeDispatcher = storeDispatcher;
    }
  },
  navigate: navigationParams => {
    const { routeName, params, action = [], key = '' } = navigationParams;
    if (config.navigator && routeName) {
      if (blacklists.resetStackRoutes.includes(routeName)) {
        if (action && action.push) {
          action.push(StackActions.reset({ index: 0 }));
        }
        config.navigator.dispatch(
          NavigationActions.navigate({ routeName, params, action, key })
        );
      } else {
        config.navigator.dispatch(
          NavigationActions.navigate({ routeName, params, action, key })
        );
      }
      config.storeDispatcher({
        type: ApplicationTypes.NAVIGATE,
        routeName,
        params,
        action,
        key
      });
    }
  }
};

export default NavigationService;
