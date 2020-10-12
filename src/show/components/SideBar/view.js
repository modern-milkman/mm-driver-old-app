import PropTypes from 'prop-types';
import Config from 'react-native-config';
import React, { useEffect, useState } from 'react';
import { Animated, View, TouchableOpacity } from 'react-native';

import I18n from 'Locales/I18n';
import Text from 'Components/Text';
import { deviceFrame } from 'Helpers';
import { defaults, colors } from 'Theme';
import { ListItem } from 'Components/List';
import Separator from 'Components/Separator';
import NavigationService from 'Navigation/service';
import { ColumnView, SafeAreaView, RowView } from 'Containers';

import { navigateInSheet } from 'Screens/session/Main/helpers';

import styles from './styles';

const { width } = deviceFrame();
const sidebarWidth = 0.8 * width;

const navigateAndClose = (updateProps, routeName) => {
  NavigationService.navigate({ routeName });
  updateProps({ sideBarOpen: false });
};

const SideBar = (props) => {
  const {
    availableNavApps,
    driverId,
    name,
    updateProps,
    sideBarOpen,
    source
  } = props;
  const [left] = useState(new Animated.Value(-sidebarWidth));
  const [opacity] = useState(new Animated.Value(0));
  const [show, setShow] = useState(sideBarOpen);

  useEffect(() => {
    if (!sideBarOpen) {
      Animated.parallel([
        Animated.timing(left, {
          toValue: -sidebarWidth,
          duration: 250,
          useNativeDriver: false
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => {
        setShow(false);
      });
    } else {
      setShow(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(left, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [left, opacity, sideBarOpen]);

  return (
    show && (
      <View style={styles.sideBarWrapper}>
        <Animated.View style={{ ...styles.closeArea, opacity: opacity }}>
          <TouchableOpacity
            style={styles.fullView}
            onPress={updateProps.bind(null, { sideBarOpen: false })}
          />
        </Animated.View>

        <Animated.View
          style={{ ...styles.content, left: left, width: sidebarWidth }}>
          <SafeAreaView top bottom style={styles.fullView}>
            <ColumnView flex={1} justifyContent={'space-between'}>
              <ColumnView>
                <ColumnView
                  alignItems={'flex-start'}
                  paddingHorizontal={defaults.marginHorizontal}
                  marginVertical={defaults.marginVertical}>
                  <Text.List color={colors.secondary}>{`${name}`}</Text.List>
                  <Text.Caption color={colors.secondary}>
                    {I18n.t('screens:panel.driverID', { driverId })}
                  </Text.Caption>
                </ColumnView>
                <Separator
                  marginHorizontal={defaults.marginHorizontal}
                  width={sidebarWidth - 2 * defaults.marginHorizontal}
                />
                <ColumnView alignItems={'stretch'}>
                  <ListItem
                    icon={null}
                    onPress={navigateAndClose.bind(
                      null,
                      updateProps,
                      'Settings'
                    )}
                    title={I18n.t('routes:settings')}
                  />
                </ColumnView>
              </ColumnView>

              <ColumnView
                justifyContent={'flex-start'}
                alignItems={'flex-start'}
                marginVertical={defaults.marginVertical}>
                <ListItem
                  customIcon={'gas'}
                  title={I18n.t('screens:panel.gasStation')}
                  rightIcon={'chevron-right'}
                  onPress={navigateInSheet.bind(null, {
                    availableNavApps,
                    source,
                    lookForGasStation: true
                  })}
                />

                <RowView
                  justifyContent={'flex-start'}
                  marginHorizontal={defaults.marginHorizontal}>
                  <Text.List
                    color={
                      colors.inputDark
                    }>{`Version: ${Config.APP_VERSION_NAME}`}</Text.List>
                </RowView>
              </ColumnView>
            </ColumnView>
          </SafeAreaView>
        </Animated.View>
      </View>
    )
  );
};

SideBar.propTypes = {
  availableNavApps: PropTypes.array,
  driverId: PropTypes.number,
  name: PropTypes.string,
  sideBarOpen: PropTypes.bool,
  source: PropTypes.object,
  updateProps: PropTypes.func,
  userId: PropTypes.func
};

export default SideBar;
