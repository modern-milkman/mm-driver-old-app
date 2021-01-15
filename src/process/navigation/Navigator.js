//TODO upgrade to nav v5
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import {
  //Screens
  CheckIn,
  CustomerIssueDetails,
  CustomerIssueList,
  Deliver,
  Home,
  LoadVan,
  Main,
  Settings,
  UpgradeApp,
  CustomerIssueModal
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

const Modals = createStackNavigator(
  {
    CustomerIssueModal: {
      screen: CustomerIssueModal
    }
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
      cardStyle: {
        backgroundColor: 'transparent'
      }
    },
    initialRouteName: 'CustomerIssueModal'
  }
);

// TOP NAVIGATOR [ Home, Main, UpgradeApp]
const TopNavigator = createStackNavigator(
  {
    Home,
    MainNavigator,
    UpgradeApp,
    Modals
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
      gestureEnabled: false,
      cardStyle: {
        backgroundColor: 'transparent'
      }
    },
    initialRouteName: 'Home',
    mode: 'modal'
  }
);

export default createAppContainer(TopNavigator);
