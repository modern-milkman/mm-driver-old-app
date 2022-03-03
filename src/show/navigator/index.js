import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import {
  createStackNavigator,
  TransitionPresets
} from '@react-navigation/stack';

import DrawerNavigator from './subViews/DrawerNav';
import { navigationRef } from 'Services/navigation';
import {
  CheckIn,
  CustomerIssueDetails,
  CustomerIssueList,
  CustomerIssueModal,
  EmptiesCollected,
  Deliver,
  Home,
  LoadVan,
  LowConnectionModal,
  PermissionsMissing,
  RegistrationMileage,
  Settings,
  UpgradeApp
} from 'Screens';

const Stack = createStackNavigator();

const Navigator = ({ userSessionPresent }) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={!userSessionPresent ? 'Home' : 'Main'}>
        {!userSessionPresent ? (
          <Stack.Group
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
              cardStyle: { backgroundColor: 'transparent' }
            }}>
            <Stack.Screen name="Home" component={Home} />
          </Stack.Group>
        ) : (
          <>
            {MainNavigator()}
            {VechicleCheckWizardNavigator()}
            {ModalNavigator()}
          </>
        )}
        <Stack.Group
          screenOptions={{
            headerShown: false,
            gestureEnabled: false
          }}>
          <Stack.Screen
            name="PermissionsMissing"
            component={PermissionsMissing}
          />
          <Stack.Screen name="UpgradeApp" component={UpgradeApp} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const VechicleCheckWizardNavigator = () => (
  <Stack.Group
    initialRouteName="RegistrationMileage"
    screenOptions={{
      headerShown: false,
      gestureEnabled: false
    }}>
    <Stack.Screen name="RegistrationMileage" component={RegistrationMileage} />
    <Stack.Screen name="EmptiesCollected" component={EmptiesCollected} />
  </Stack.Group>
);

const MainNavigator = () => (
  <Stack.Group
    initialRouteName="Main"
    screenOptions={{
      headerShown: false,
      gestureEnabled: false,
      detachPreviousScreen: true
    }}>
    <Stack.Screen name="Main" component={DrawerNavigator} />
    <Stack.Screen
      name="CheckIn"
      options={TransitionPresets.ScaleFromCenterAndroid}
      component={CheckIn}
    />
    <Stack.Screen
      name="Deliver"
      component={Deliver}
      options={TransitionPresets.ScaleFromCenterAndroid}
    />
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="LoadVan" component={LoadVan} />
    <Stack.Screen name="CustomerIssueList" component={CustomerIssueList} />
    <Stack.Screen
      name="CustomerIssueDetails"
      component={CustomerIssueDetails}
    />
  </Stack.Group>
);

const ModalNavigator = () => (
  <Stack.Group
    screenOptions={{
      headerShown: false,
      gestureEnabled: false,
      presentation: 'transparentModal'
    }}>
    <Stack.Screen name="CustomerIssueModal" component={CustomerIssueModal} />
    <Stack.Screen name="LowConnectionModal" component={LowConnectionModal} />
  </Stack.Group>
);

Navigator.propTypes = {
  userSessionPresent: PropTypes.bool
};

const mapStateToProps = state => ({
  userSessionPresent: state.application.userSessionPresent
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);
