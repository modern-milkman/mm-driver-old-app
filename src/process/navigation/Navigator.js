//TODO upgrade to nav v5
import { createAppContainer } from 'react-navigation';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

import { Home, UpgradeApp } from '/show/screens';

// TOP NAVIGATOR [ Home]
const TopNavigator = createSharedElementStackNavigator(
  {
    Home: Home,
    UpgradeApp: UpgradeApp
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
      cardShadowEnabled: false
    },
    initialRouteName: 'Home'
  }
);

export default createAppContainer(TopNavigator);
