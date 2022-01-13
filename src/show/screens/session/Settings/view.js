import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import Alert from 'Services/alert';
import Vibration from 'Services/vibration';
import { colors, defaults, sizes } from 'Theme';
import { deliverProductsDisabled } from 'Helpers';
import NavigationService from 'Services/navigation';
import Analytics, { EVENTS } from 'Services/analytics';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import {
  Button,
  ListHeader,
  NavBar,
  Text,
  Separator,
  Slider,
  Switch
} from 'Components';

const disableBiometrics = biometricDisable => {
  Alert({
    title: I18n.t('alert:success.settings.biometrics.title'),
    message: I18n.t('alert:success.settings.biometrics.message'),
    buttons: [
      {
        text: I18n.t('general:cancel'),
        style: 'cancel'
      },
      {
        text: I18n.t('general:disable'),
        onPress: biometricDisable
      }
    ]
  });
};

const onForegroundSizeChange = (updateDeviceProps, value) => {
  updateDeviceProps({ foregroundSize: value ? 'large' : 'small' });
};

const onSliderChange = (updateDeviceProps, prop, value) => {
  const updateProps = {};
  updateProps[prop] = value[0];
  updateDeviceProps(updateProps);
};

const onVibrateChange = (updateDeviceProps, vibrate) => {
  updateDeviceProps({ vibrate });
  if (vibrate) {
    Vibration.vibrate();
  }
};

const performLogout = logout => {
  Analytics.trackEvent(EVENTS.TAP_LOGOUT);
  logout();
};

const toggleDeviceProp = (updateDeviceProps, prop, value) => {
  const updateProp = {};
  updateProp[prop] = value;
  updateDeviceProps({ ...updateProp });
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

const onOptimization = (
  { continueDelivering, checklist, status, updateDeviceProps },
  autoSelectStop
) => {
  updateDeviceProps({ autoSelectStop });
  if (autoSelectStop && !deliverProductsDisabled({ checklist, status })) {
    continueDelivering();
  }
};

const Settings = props => {
  const {
    autoSelectStop,
    biometrics,
    biometricDisable,
    buttonAccessibility,
    checklist,
    computeDirections,
    computeShortDirections,
    continueDelivering,
    countDown,
    foregroundSize,
    isOptimised,
    logout,
    mapMarkerSize,
    optimisedStopsToShow,
    network,
    showDoneDeliveries,
    showMapControlsOnMovement,
    showAllPendingStops,
    status,
    updateDeviceProps,
    vibrate
  } = props;

  return (
    <SafeAreaView>
      <ColumnView
        flex={1}
        justifyContent={'space-between'}
        alignItems={'stretch'}
        backgroundColor={colors.neutral}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          title={I18n.t('routes:settings')}
          marginHorizontal={defaults.marginHorizontal / 3}
        />
        <ColumnView
          scrollable
          justifyContent={'flex-start'}
          alignItems={'stretch'}
          width={'auto'}>
          <ListHeader
            title={I18n.t('screens:settings.sections.routeManagement')}
          />

          <ColumnView
            alignItems={'flex-start'}
            marginVertical={defaults.marginVertical / 2}
            marginHorizontal={defaults.marginHorizontal}
            width={'auto'}>
            <RowView justifyContent={'space-between'}>
              <ColumnView flex={1} alignItems={'flex-start'}>
                <Text.List color={colors.secondary}>
                  {I18n.t('screens:settings.sliders.optimisedStopsToShow')}
                </Text.List>
                {!isOptimised && (
                  <Text.Caption color={colors.secondary}>
                    {I18n.t(
                      'screens:settings.switches.optimisedRoutingUnavailable'
                    )}
                  </Text.Caption>
                )}
              </ColumnView>
              <Text.List color={colors.secondary}>
                {optimisedStopsToShow}
              </Text.List>
            </RowView>

            <Slider
              onSlidingComplete={onSliderChange.bind(
                null,
                updateDeviceProps,
                'optimisedStopsToShow'
              )}
              minimumValue={5}
              maximumValue={50}
              step={1}
              value={optimisedStopsToShow}
              disabled={!isOptimised}
            />
          </ColumnView>

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.secondary}>
                {I18n.t('screens:settings.switches.showAllPendingStops.title')}
              </Text.List>

              <Text.Caption color={colors.secondary}>
                {I18n.t(
                  isOptimised
                    ? 'screens:settings.switches.showAllPendingStops.description'
                    : 'screens:settings.switches.optimisedRoutingUnavailable'
                )}
              </Text.Caption>
            </ColumnView>

            <Switch
              value={showAllPendingStops}
              onValueChange={toggleDeviceProp.bind(
                null,
                updateDeviceProps,
                'showAllPendingStops'
              )}
              disabled={!isOptimised}
            />
          </RowView>

          <Separator marginLeft={defaults.marginHorizontal} />

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.secondary}>
                {I18n.t('screens:settings.switches.autoSelectStop')}
              </Text.List>
              {!isOptimised && (
                <Text.Caption color={colors.secondary}>
                  {I18n.t(
                    'screens:settings.switches.optimisedRoutingUnavailable'
                  )}
                </Text.Caption>
              )}
            </ColumnView>

            <Switch
              value={autoSelectStop}
              onValueChange={onOptimization.bind(null, {
                checklist,
                continueDelivering,
                status,
                updateDeviceProps
              })}
              disabled={!isOptimised}
            />
          </RowView>

          <Separator marginLeft={defaults.marginHorizontal} />

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.switches.showDoneDeliveries')}
            </Text.List>
            <Switch
              value={showDoneDeliveries}
              onValueChange={toggleDeviceProp.bind(
                null,
                updateDeviceProps,
                'showDoneDeliveries'
              )}
            />
          </RowView>

          <Separator marginLeft={defaults.marginHorizontal} />

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.switches.computeDirections')}
            </Text.List>
            <Switch
              value={computeDirections}
              onValueChange={toggleDeviceProp.bind(
                null,
                updateDeviceProps,
                'computeDirections'
              )}
            />
          </RowView>

          {computeDirections && (
            <>
              <Separator marginLeft={defaults.marginHorizontal} />

              <RowView
                marginHorizontal={defaults.marginHorizontal}
                justifyContent={'space-between'}
                marginVertical={defaults.marginVertical / 2}
                width={'auto'}>
                <Text.List color={colors.secondary}>
                  {I18n.t('screens:settings.switches.computeShortDirections')}
                </Text.List>
                <Switch
                  value={computeShortDirections}
                  onValueChange={toggleDeviceProp.bind(
                    null,
                    updateDeviceProps,
                    'computeShortDirections'
                  )}
                />
              </RowView>
            </>
          )}

          <Separator />

          <ListHeader title={I18n.t('screens:settings.sections.map')} />

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.switches.showMapControlsOnMovement')}
            </Text.List>
            <Switch
              value={showMapControlsOnMovement}
              onValueChange={toggleDeviceProp.bind(
                null,
                updateDeviceProps,
                'showMapControlsOnMovement'
              )}
            />
          </RowView>

          <Separator marginLeft={defaults.marginHorizontal} />

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.switches.foreground')}
            </Text.List>
            <Switch
              value={foregroundSize === 'large'}
              onValueChange={onForegroundSizeChange.bind(
                null,
                updateDeviceProps
              )}
            />
          </RowView>

          <Separator marginLeft={defaults.marginHorizontal} />

          {/*TODO remove countDown switch in later release*/}
          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.secondary}>
                {I18n.t('screens:settings.switches.deliveriesRemaining')}
              </Text.List>
              <Text.Caption color={colors.secondary}>
                {I18n.t('screens:settings.switches.deliveriesCountDown')}
              </Text.Caption>
            </ColumnView>
            <Switch
              disabled={true}
              value={countDown}
              onValueChange={toggleDeviceProp.bind(
                null,
                updateDeviceProps,
                'countDown'
              )}
            />
          </RowView>

          <Separator marginLeft={defaults.marginHorizontal} />

          <ColumnView
            alignItems={'flex-start'}
            marginVertical={defaults.marginVertical / 2}
            marginHorizontal={defaults.marginHorizontal}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.sliders.mapMarkers')}
            </Text.List>
            <Text.Caption color={colors.secondary}>
              {I18n.t('screens:settings.sliders.drag')}
            </Text.Caption>

            <Slider
              onSlidingComplete={onSliderChange.bind(
                null,
                updateDeviceProps,
                'mapMarkerSize'
              )}
              minimumValue={sizes.marker.small}
              maximumValue={sizes.marker.large}
              step={sizes.marker.step}
              value={mapMarkerSize}
            />
          </ColumnView>

          <Separator />

          <ListHeader title={I18n.t('screens:settings.sections.device')} />

          <ColumnView
            alignItems={'flex-start'}
            marginVertical={defaults.marginVertical / 2}
            marginHorizontal={defaults.marginHorizontal}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.sliders.buttons')}
            </Text.List>
            <Text.Caption color={colors.secondary}>
              {I18n.t('screens:settings.sliders.drag')}
            </Text.Caption>

            <Slider
              onSlidingComplete={onSliderChange.bind(
                null,
                updateDeviceProps,
                'buttonAccessibility'
              )}
              minimumValue={sizes.button.small}
              maximumValue={sizes.button.large}
              step={sizes.button.step}
              value={buttonAccessibility}
            />
          </ColumnView>

          <Separator marginLeft={defaults.marginHorizontal} />

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.switches.vibrations')}
            </Text.List>
            <Switch
              value={vibrate}
              onValueChange={onVibrateChange.bind(null, updateDeviceProps)}
            />
          </RowView>

          <Separator />

          {biometrics.supported && (
            <>
              <ListHeader
                title={I18n.t('screens:settings.sections.authentication')}
              />

              <RowView
                marginHorizontal={defaults.marginHorizontal}
                justifyContent={'space-between'}
                marginVertical={defaults.marginVertical / 2}
                width={'auto'}>
                <ColumnView flex={1} alignItems={'flex-start'}>
                  <Text.List color={colors.secondary}>
                    {I18n.t('screens:home.biometrics.login')}
                  </Text.List>
                  <Text.Caption color={colors.secondary}>
                    {I18n.t('screens:settings.switches.biometricsDisabled')}
                  </Text.Caption>
                </ColumnView>
                <Switch
                  value={biometrics.active}
                  onValueChange={disableBiometrics.bind(null, biometricDisable)}
                  disabled={!biometrics.active}
                />
              </RowView>

              <Separator />
            </>
          )}
        </ColumnView>
        <RowView
          alignItems={'stretch'}
          width={'auto'}
          height={buttonAccessibility}
          marginHorizontal={defaults.marginHorizontal}
          marginVertical={defaults.marginVertical}>
          <Button.Error
            title={I18n.t('general:logout')}
            onPress={triggerLogout.bind(null, { logout, network })}
          />
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

Settings.propTypes = {
  autoSelectStop: PropTypes.bool,
  biometrics: PropTypes.object,
  biometricDisable: PropTypes.func,
  buttonAccessibility: PropTypes.number,
  checklist: PropTypes.object,
  computeDirections: PropTypes.bool,
  computeShortDirections: PropTypes.bool,
  continueDelivering: PropTypes.func,
  countDown: PropTypes.bool,
  currentLocation: PropTypes.object,
  foregroundSize: PropTypes.string,
  isOptimised: PropTypes.bool,
  logout: PropTypes.func,
  mapMarkerSize: PropTypes.number,
  optimisedStopsToShow: PropTypes.number,
  network: PropTypes.object,
  showDoneDeliveries: PropTypes.bool,
  showMapControlsOnMovement: PropTypes.bool,
  showAllPendingStops: PropTypes.bool,
  status: PropTypes.string,
  updateDeviceProps: PropTypes.func,
  vibrate: PropTypes.bool
};

Settings.defaultProps = {};

export default Settings;
