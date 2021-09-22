//TODO upgrade to nav v5
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import {
  //Screens
  CheckIn,
  Checklist,
  CustomerIssueDetails,
  CustomerIssueList,
  CustomerIssueModal,
  DamageReport,
  EmptiesCollected,
  Deliver,
  Home,
  LoadVan,
  LowConnectionModal,
  Main,
  PermissionsMissing,
  Reports,
  RegistrationMileage,
  Settings,
  UpgradeApp
} from 'Screens';

const VechicleCheckWizardNavigator = createStackNavigator(
  {
    RegistrationMileage: {
      screen: RegistrationMileage
    },
    EmptiesCollected: {
      screen: EmptiesCollected
    },
    DamageReport: {
      screen: DamageReport
    },
    Checklist: {
      screen: Checklist
    }
  },
  {
    initialRouteName: 'RegistrationMileage',
    defaultNavigationOptions: {
      headerShown: false, //might be a breaking change from react-native-screens 3.2.x as opposed to 2.18.1
      gestureEnabled: false
    }
  }
);

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
    },
    VechicleCheckWizardNavigator,
    Reports: {
      screen: Reports
    }
  },
  {
    initialRouteName: 'Main',
    defaultNavigationOptions: {
      headerShown: false, //might be a breaking change from react-native-screens 3.2.x as opposed to 2.18.1
      gestureEnabled: false
    }
  }
);

const Modals = createSwitchNavigator(
  {
    CustomerIssueModal: {
      screen: CustomerIssueModal
    },
    LowConnectionModal: {
      screen: LowConnectionModal
    }
  },
  {
    defaultNavigationOptions: {
      initialRouteName: 'CustomerIssueModal',
      backBehavior: 'history'
    }
  }
);

// TOP NAVIGATOR [ Home, Main, UpgradeApp]
const TopNavigator = createStackNavigator(
  {
    Home,
    MainNavigator,
    Modals,
    UpgradeApp,
    PermissionsMissing
  },
  {
    defaultNavigationOptions: {
      headerShown: false, //might be a breaking change from react-native-screens 3.2.x as opposed to 2.18.1
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
