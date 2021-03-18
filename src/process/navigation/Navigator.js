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
  Deliver,
  Home,
  LoadVan,
  LowConnectionModal,
  Main,
  Reports,
  RegistrationMileage,
  Settings,
  UpgradeApp
} from 'Screens';

const VechicleCheckWizardNavigator = createStackNavigator(
  {
    Checklist: {
      screen: Checklist
    },
    DamageReport: {
      screen: DamageReport
    },
    RegistrationMileage: {
      screen: RegistrationMileage
    }
  },
  {
    initialRouteName: 'RegistrationMileage',
    defaultNavigationOptions: {
      headerShown: false,
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
      headerShown: false,
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
    UpgradeApp
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
