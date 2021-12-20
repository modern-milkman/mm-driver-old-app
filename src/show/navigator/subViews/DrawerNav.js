import React from 'react';
import PropTypes from 'prop-types';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { Main } from 'Screens';
import { SideBar } from 'Components';

const Drawer = createDrawerNavigator();

const renderDrawerContent = props => <SideBar navigation={props.navigation} />;

const DrawerNavigator = () => (
  <Drawer.Navigator
    initialRouteName="initialMain"
    screenOptions={{
      drawerType: 'front',
      headerShown: false,
      gestureEnabled: false
    }}
    drawerContent={renderDrawerContent}>
    <Drawer.Screen name="initialMain" component={Main} />
  </Drawer.Navigator>
);

DrawerNavigator.propTypes = {
  navigation: PropTypes.object
};

export default DrawerNavigator;
