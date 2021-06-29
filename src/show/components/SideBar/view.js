import PropTypes from 'prop-types';
import { gt as semverGt } from 'semver';
import Config from 'react-native-config';
import React, { useEffect, useState } from 'react';
import { Animated, View, TouchableOpacity } from 'react-native';

import I18n from 'Locales/I18n';
import Text from 'Components/Text';
import { defaults, colors } from 'Theme';
import { ListItem } from 'Components/List';
import Separator from 'Components/Separator';
import NavigationService from 'Navigation/service';
import { ColumnView, SafeAreaView, RowView } from 'Containers';
import { navigateInSheet } from 'Screens/session/Main/helpers';
import {
  deviceFrame,
  deliveryStates as DS,
  triggerDriverUpdate
} from 'Helpers';

import styles from './styles';

const { width } = deviceFrame();
const sidebarWidth = 0.8 * width;

const navigateAndClose = (updateProps, callback) => {
  updateProps({ sideBarOpen: false });
  if (callback) {
    callback();
  }
};

const SideBar = props => {
  const {
    appcenter,
    availableNavApps,
    driverId,
    name,
    network,
    requestQueues,
    sideBarOpen,
    source,
    status,
    updateInAppBrowserProps,
    updateProps
  } = props;

  const showOfflineLabel =
    requestQueues.offline.length > 0 || requestQueues.failed.length > 0;

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
                      NavigationService.navigate.bind(null, {
                        routeName: 'Settings'
                      })
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
                  title={I18n.t('screens:panel.suggestions')}
                  icon={'lightbulb-outline'}
                  rightIcon={'chevron-right'}
                  onPress={navigateAndClose.bind(
                    null,
                    updateProps,
                    updateInAppBrowserProps.bind(null, {
                      visible: true,
                      url: Config.SUGGESTION_URL
                    })
                  )}
                />

                {status === DS.DEL && (
                  <ListItem
                    title={I18n.t('screens:checkIn.loadVan')}
                    rightIcon={'chevron-right'}
                    onPress={navigateAndClose.bind(
                      null,
                      updateProps,
                      NavigationService.navigate.bind(null, {
                        routeName: 'LoadVan',
                        params: { readOnly: true }
                      })
                    )}
                    customIcon={'van'}
                  />
                )}

                {network.status !== 2 && (
                  <ListItem
                    customIcon={'gas'}
                    title={I18n.t('screens:panel.gasStation')}
                    rightIcon={'chevron-right'}
                    onPress={navigateAndClose.bind(
                      null,
                      updateProps,
                      navigateInSheet.bind(null, {
                        availableNavApps,
                        source,
                        lookForGasStation: true
                      })
                    )}
                  />
                )}

                {showOfflineLabel && (
                  <ListItem
                    icon={'information-outline'}
                    title={I18n.t('routes:reports')}
                    rightIcon={'chevron-right'}
                    onPress={navigateAndClose.bind(
                      null,
                      updateProps,
                      NavigationService.navigate.bind(null, {
                        routeName: 'Reports'
                      })
                    )}
                  />
                )}

                {network.status !== 2 &&
                  appcenter &&
                  appcenter?.short_version &&
                  appcenter?.download_url &&
                  semverGt(
                    appcenter?.short_version,
                    Config.APP_VERSION_NAME
                  ) && (
                    <ListItem
                      title={I18n.t('screens:upgradeApp.download', {
                        version: appcenter.short_version
                      })}
                      icon={'cellphone-android'}
                      rightIcon={'cloud-download-outline'}
                      onPress={triggerDriverUpdate.bind(
                        null,
                        appcenter?.download_url
                      )}
                    />
                  )}

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
  appcenter: PropTypes.object,
  availableNavApps: PropTypes.array,
  driverId: PropTypes.number,
  name: PropTypes.string,
  network: PropTypes.object,
  requestQueues: PropTypes.object,
  sideBarOpen: PropTypes.bool,
  source: PropTypes.object,
  status: PropTypes.string,
  updateInAppBrowserProps: PropTypes.func,
  updateProps: PropTypes.func,
  userId: PropTypes.func
};

export default SideBar;
