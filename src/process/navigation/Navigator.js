//TODO upgrade to nav v5
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { Home, Main, UpgradeApp } from 'Screens';

// TOP NAVIGATOR [ Home]
const TopNavigator = createStackNavigator(
  {
    Home: Home,
    Main: Main,
    UpgradeApp: UpgradeApp
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
      cardShadowEnabled: false,
      gestureEnabled: false
    },
    initialRouteName: 'Home'
  }
);

export default createAppContainer(TopNavigator);
