import React from 'react';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { coerce, gt as semverGt } from 'semver';

import I18n from 'Locales/I18n';
import Text from 'Components/Text';
import Alert from 'Services/alert';
import { defaults, sizes } from 'Theme';
import { ListItem } from 'Components/List';
import Separator from 'Components/Separator';
import NavigationService from 'Services/navigation';
import Analytics, { EVENTS } from 'Services/analytics';
import { navigateInSheet } from 'Screens/session/Main/helpers';
import { ColumnView, SafeAreaView, RowView, useTheme } from 'Containers';
import {
  appVersionString,
  deliveryStates as DS,
  triggerDriverUpdate
} from 'Helpers';

import styles from './styles';

const navigateAndClose = (closeDrawer, callback) => {
  closeDrawer();
  if (callback) {
    callback();
  }
};

const performLogout = logout => {
  Analytics.trackEvent(EVENTS.TAP_LOGOUT);
  logout();
};

const triggerLogout = ({ logout, network }) => {
  if (network.status === 0) {
    Alert({
      title: I18n.t('alert:success.settings.logout.title'),
      message: I18n.t('alert:success.settings.logout.message'),
      buttons: [
        {
          text: I18n.t('general:cancel'),
          style: 'cancel'
        },
        {
          text: I18n.t('general:logout'),
          onPress: performLogout.bind(null, logout)
        }
      ]
    });
  } else {
    Alert({
      title: I18n.t('alert:success.settings.offline.logout.title'),
      message: I18n.t('alert:success.settings.offline.logout.message'),
      buttons: [
        {
          text: I18n.t('general:cancel'),
          style: 'cancel'
        },
        {
          text: I18n.t('general:logout'),
          onPress: performLogout.bind(null, logout)
        }
      ]
    });
  }
};

const SideBar = props => {
  const { colors } = useTheme();
  const {
    appcenter,
    availableNavApps,
    driverId,
    logout,
    name,
    navigation,
    network,
    source,
    status
  } = props;

  return (
    <SafeAreaView style={styles.flex1}>
      <ColumnView flex={1} justifyContent={'space-between'}>
        <ColumnView>
          <ColumnView
            alignItems={'flex-start'}
            paddingHorizontal={defaults.marginHorizontal}
            marginVertical={defaults.marginVertical}>
            <Text.List color={colors.inputSecondary}>{`${name}`}</Text.List>
            <Text.Caption color={colors.inputSecondary}>
              {I18n.t('screens:panel.driverID', { driverId })}
            </Text.Caption>
          </ColumnView>
          <Separator
            marginHorizontal={defaults.marginHorizontal}
            width={'100%'}
          />
          <ColumnView alignItems={'stretch'}>
            <ListItem
              customIconProps={{
                containerSize: sizes.sidebar.icon.default,
                width: sizes.sidebar.icon.default
              }}
              icon={'cog'}
              onPress={navigateAndClose.bind(
                null,
                navigation.closeDrawer,
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
          <ColumnView alignItems={'flex-start'}>
            <ListItem
              customIconProps={{
                containerSize: sizes.sidebar.icon.default,
                width: sizes.sidebar.icon.default
              }}
              icon={'logout'}
              title={I18n.t('general:logout')}
              onPress={triggerLogout.bind(null, { logout, network })}
            />
            <Separator width={'100%'} />
          </ColumnView>

          {status === DS.DEL && (
            <>
              <ListItem
                title={I18n.t('screens:checkIn.loadMMVan')}
                rightIcon={'chevron-right'}
                onPress={navigateAndClose.bind(
                  null,
                  navigation.closeDrawer,
                  NavigationService.navigate.bind(null, {
                    routeName: 'LoadVan',
                    params: { readOnly: true, type: 'MM' }
                  })
                )}
                customIcon={'loadVan'}
                customIconProps={{
                  containerSize: sizes.sidebar.icon.default,
                  width: sizes.sidebar.icon.large
                }}
              />
              <ListItem
                title={I18n.t('screens:checkIn.load3PLVan')}
                rightIcon={'chevron-right'}
                onPress={navigateAndClose.bind(
                  null,
                  navigation.closeDrawer,
                  NavigationService.navigate.bind(null, {
                    routeName: 'LoadVan',
                    params: { readOnly: true, type: 'TPL' }
                  })
                )}
                customIcon={'loadVan'}
                customIconProps={{
                  containerSize: sizes.sidebar.icon.default,
                  width: sizes.sidebar.icon.large
                }}
              />
              <ListItem
                title={I18n.t('screens:checkIn.scanToVan')}
                rightIcon={'chevron-right'}
                onPress={navigateAndClose.bind(
                  null,
                  navigation.closeDrawer,
                  NavigationService.navigate.bind(null, {
                    routeName: 'LoadVan',
                    params: { readOnly: true, type: 'Barcode' }
                  })
                )}
                customIcon={'barcode'}
                customIconProps={{
                  containerSize: sizes.sidebar.icon.default,
                  width: sizes.sidebar.icon.large
                }}
              />
            </>
          )}

          {network.status !== 2 && (
            <ColumnView
              alignItems={'flex-start'}
              marginBottom={defaults.marginVertical}>
              <ListItem
                customIcon={'gas'}
                customIconProps={{
                  containerSize: sizes.sidebar.icon.default,
                  width: sizes.sidebar.icon.default
                }}
                title={I18n.t('screens:panel.gasStation')}
                secondaryCustomRightIcon={'expand'}
                secondaryCustomRightIconProps={{
                  containerWidth: sizes.sidebar.icon.small,
                  width: sizes.sidebar.icon.small
                }}
                onPress={navigateInSheet.bind(null, {
                  availableNavApps,
                  source,
                  lookForGasStation: true
                })}
              />
              <Separator width={'100%'} />
            </ColumnView>
          )}

          {network.status !== 2 &&
            appcenter &&
            appcenter?.short_version &&
            appcenter?.download_url &&
            semverGt(
              appcenter?.short_version,
              coerce(Config.APP_VERSION_NAME)
            ) && (
              <ListItem
                customIconProps={{
                  containerSize: sizes.sidebar.icon.default,
                  width: sizes.sidebar.icon.default
                }}
                title={I18n.t('screens:upgradeApp.download', {
                  version: appcenter.short_version
                })}
                icon={'cellphone'}
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
            <Text.List color={colors.inputSecondary}>
              {appVersionString()}
            </Text.List>
          </RowView>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

SideBar.propTypes = {
  appcenter: PropTypes.object,
  availableNavApps: PropTypes.array,
  driverId: PropTypes.number,
  logout: PropTypes.func,
  name: PropTypes.string,
  navigation: PropTypes.object,
  network: PropTypes.object,
  source: PropTypes.object,
  status: PropTypes.string
};

export default SideBar;
