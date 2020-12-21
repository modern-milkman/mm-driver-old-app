//TODO upgrade to nav v5
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import {
  CheckIn,
  CustomerIssueDetails,
  CustomerIssueList,
  Deliver,
  Home,
  LoadVan,
  Main,
  Settings,
  UpgradeApp
} from 'Screens';

const MainNavigator = createStackNavigator(
  {
    Main: {
      screen: Main
    },
    CheckIn: {
      screen: CheckIn
    },
    Deliver: {
      screen: Deliver
    },
    LoadVan: {
      screen: LoadVan
    },
    Settings: {
      screen: Settings
    },
    CustomerIssueList: {
      screen: CustomerIssueList
    },
    CustomerIssueDetails: {
      screen: CustomerIssueDetails
    }
  },
  {
    initialRouteName: 'Main',
    defaultNavigationOptions: {
      headerShown: false,
      gestureEnabled: false
    }
  }
);

// TOP NAVIGATOR [ Home, Main]
const TopNavigator = createStackNavigator(
  {
    Home,
    MainNavigator,
    UpgradeApp
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
