import React from 'react';
import PropTypes from 'prop-types';
import { Pressable } from 'react-native';
import RNRestart from 'react-native-restart';

import I18n from 'Locales/I18n';
import Alert from 'Services/alert';
import { defaults, sizes } from 'Theme';
import Vibration from 'Services/vibration';
import NavigationService from 'Services/navigation';
import { ColumnView, RowView, SafeAreaView, useTheme } from 'Containers';
import {
  Label,
  ListItem,
  ListHeader,
  NavBar,
  Text,
  Separator,
  Slider,
  Switch
} from 'Components';
import {
  actionSheetSwitch,
  availableLanguages,
  deliverProductsDisabled,
  mock,
  openTerms
} from 'Helpers';

import style from './style';

const changeLanguageAndRestartApp = ({ setLanguage }, language) => {
  setLanguage(language);
  NavigationService.goBack({ afterCallback: RNRestart.Restart });
};

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

const toggleProp = (updateProps, prop, value) => {
  const updateProp = {};
  updateProp[prop] = value;
  updateProps({ ...updateProp });
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
  const { colors } = useTheme();
  const {
    autoOpenStopDetails,
    autoSelectStop,
    biometricDisable,
    biometrics,
    buttonAccessibility,
    checklist,
    computeDirections,
    computeShortDirections,
    continueDelivering,
    countDown,
    darkMode,
    foregroundSize,
    isOptimised,
    language,
    largerDeliveryText,
    mapMarkerSize,
    optimisedStopsToShow,
    setLanguage,
    showAllPendingStops,
    showDoneDeliveries,
    showMapControlsOnMovement,
    status,
    updateDeviceProps = mock,
    updateInAppBrowserProps = mock,
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
                <Text.List color={colors.inputSecondary}>
                  {I18n.t('screens:settings.sliders.optimisedStopsToShow')}
                </Text.List>
                {!isOptimised && (
                  <Text.Caption color={colors.inputSecondary}>
                    {I18n.t(
                      'screens:settings.switches.optimisedRoutingUnavailable'
                    )}
                  </Text.Caption>
                )}
              </ColumnView>
              <Text.List color={colors.inputSecondary}>
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

          <Pressable
            onPress={toggleProp.bind(
              null,
              updateDeviceProps,
              'showAllPendingStops',
              !showAllPendingStops
            )}
            style={style.pressableRow}
            disabled={!isOptimised}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.showAllPendingStops.title')}
              </Text.List>

              <Text.Caption color={colors.inputSecondary}>
                {I18n.t(
                  isOptimised
                    ? 'screens:settings.switches.showAllPendingStops.description'
                    : 'screens:settings.switches.optimisedRoutingUnavailable'
                )}
              </Text.Caption>
            </ColumnView>

            <Switch
              value={showAllPendingStops}
              onValueChange={toggleProp.bind(
                null,
                updateDeviceProps,
                'showAllPendingStops'
              )}
              disabled={!isOptimised}
            />
          </Pressable>

          <Separator marginLeft={defaults.marginHorizontal} />

          <Pressable
            onPress={onOptimization.bind(
              null,
              {
                checklist,
                continueDelivering,
                status,
                updateDeviceProps
              },
              !autoSelectStop
            )}
            style={style.pressableRow}
            disabled={!isOptimised}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.autoSelectStop')}
              </Text.List>
              {!isOptimised && (
                <Text.Caption color={colors.inputSecondary}>
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
          </Pressable>

          <Separator marginLeft={defaults.marginHorizontal} />

          <Pressable
            onPress={toggleProp.bind(
              null,
              updateDeviceProps,
              'autoOpenStopDetails',
              !autoOpenStopDetails
            )}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.autoOpenStopDetails.title')}
              </Text.List>
              <Text.Caption color={colors.inputSecondary}>
                {I18n.t(
                  'screens:settings.switches.autoOpenStopDetails.description'
                )}
              </Text.Caption>
            </ColumnView>

            <Switch
              value={autoOpenStopDetails}
              onValueChange={toggleProp.bind(
                null,
                updateDeviceProps,
                'autoOpenStopDetails'
              )}
            />
          </Pressable>

          <Separator marginLeft={defaults.marginHorizontal} />

          <Pressable
            onPress={toggleProp.bind(
              null,
              updateDeviceProps,
              'showDoneDeliveries',
              !showDoneDeliveries
            )}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.showDoneDeliveries')}
              </Text.List>
            </ColumnView>
            <Switch
              value={showDoneDeliveries}
              onValueChange={toggleProp.bind(
                null,
                updateDeviceProps,
                'showDoneDeliveries'
              )}
            />
          </Pressable>

          <Separator marginLeft={defaults.marginHorizontal} />

          <Pressable
            onPress={toggleProp.bind(
              null,
              updateDeviceProps,
              'computeDirections',
              !computeDirections
            )}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.computeDirections')}
              </Text.List>
            </ColumnView>
            <Switch
              value={computeDirections}
              onValueChange={toggleProp.bind(
                null,
                updateDeviceProps,
                'computeDirections'
              )}
            />
          </Pressable>

          {computeDirections && (
            <>
              <Separator marginLeft={defaults.marginHorizontal} />

              <Pressable
                onPress={toggleProp.bind(
                  null,
                  updateDeviceProps,
                  'computeShortDirections',
                  !computeShortDirections
                )}
                style={style.pressableRow}>
                <ColumnView flex={1} alignItems={'flex-start'}>
                  <Text.List color={colors.inputSecondary}>
                    {I18n.t('screens:settings.switches.computeShortDirections')}
                  </Text.List>
                </ColumnView>
                <Switch
                  value={computeShortDirections}
                  onValueChange={toggleProp.bind(
                    null,
                    updateDeviceProps,
                    'computeShortDirections'
                  )}
                />
              </Pressable>
            </>
          )}

          <Separator />

          <ListHeader title={I18n.t('screens:settings.sections.delivery')} />

          <Pressable
            onPress={toggleProp.bind(
              null,
              updateDeviceProps,
              'largerDeliveryText',
              !largerDeliveryText
            )}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.largerDeliveryText')}
              </Text.List>
            </ColumnView>
            <Switch
              value={largerDeliveryText}
              onValueChange={toggleProp.bind(
                null,
                updateDeviceProps,
                'largerDeliveryText'
              )}
            />
          </Pressable>

          <Separator />

          <ListHeader title={I18n.t('screens:settings.sections.map')} />

          <Pressable
            onPress={toggleProp.bind(
              null,
              updateDeviceProps,
              'showMapControlsOnMovement',
              !showMapControlsOnMovement
            )}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.showMapControlsOnMovement')}
              </Text.List>
            </ColumnView>
            <Switch
              value={showMapControlsOnMovement}
              onValueChange={toggleProp.bind(
                null,
                updateDeviceProps,
                'showMapControlsOnMovement'
              )}
            />
          </Pressable>

          <Separator marginLeft={defaults.marginHorizontal} />

          <Pressable
            onPress={onForegroundSizeChange.bind(
              null,
              updateDeviceProps,
              foregroundSize !== 'large'
            )}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.foreground')}
              </Text.List>
            </ColumnView>
            <Switch
              value={foregroundSize === 'large'}
              onValueChange={onForegroundSizeChange.bind(
                null,
                updateDeviceProps
              )}
            />
          </Pressable>

          <Separator marginLeft={defaults.marginHorizontal} />

          {/*TODO remove countDown switch in later release*/}
          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.deliveriesRemaining')}
              </Text.List>
              <Text.Caption color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.deliveriesCountDown')}
              </Text.Caption>
            </ColumnView>
            <Switch
              disabled={true}
              value={countDown}
              onValueChange={toggleProp.bind(
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
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.sliders.mapMarkers')}
              </Text.List>
              <Text.Caption color={colors.inputSecondary}>
                {I18n.t('screens:settings.sliders.drag')}
              </Text.Caption>
            </ColumnView>

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
            <Pressable
              onPress={actionSheetSwitch.bind(null, {
                label: 'languages',
                list: availableLanguages,
                method: changeLanguageAndRestartApp.bind(null, { setLanguage })
              })}>
              <RowView
                justifyContent={'space-between'}
                height={defaults.topNavigation.height}
                marginVertical={defaults.marginVertical / 2}>
                <ColumnView flex={1} alignItems={'flex-start'}>
                  <Text.List color={colors.inputSecondary}>
                    {I18n.t('screens:settings.misc.language')}
                  </Text.List>
                  <Text.Caption color={colors.inputSecondary}>
                    {I18n.t('screens:settings.misc.languageRestart')}
                  </Text.Caption>
                </ColumnView>
                <Label
                  backgroundColor={colors.inputSecondary}
                  text={I18n.t(`languages:${language}`)}
                />
              </RowView>
            </Pressable>
          </ColumnView>

          <Separator marginLeft={defaults.marginHorizontal} />

          <ColumnView
            alignItems={'flex-start'}
            marginVertical={defaults.marginVertical / 2}
            marginHorizontal={defaults.marginHorizontal}
            width={'auto'}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.sliders.buttons')}
              </Text.List>
              <Text.Caption color={colors.inputSecondary}>
                {I18n.t('screens:settings.sliders.drag')}
              </Text.Caption>
            </ColumnView>

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

          <Pressable
            onPress={onVibrateChange.bind(null, updateDeviceProps, !vibrate)}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.vibrations')}
              </Text.List>
            </ColumnView>
            <Switch
              value={vibrate}
              onValueChange={onVibrateChange.bind(null, updateDeviceProps)}
            />
          </Pressable>

          <Separator />

          <Pressable
            onPress={toggleProp.bind(
              null,
              updateDeviceProps,
              'darkMode',
              !darkMode
            )}
            style={style.pressableRow}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:settings.switches.darkMode')}
              </Text.List>
            </ColumnView>
            <Switch
              value={darkMode}
              onValueChange={toggleProp.bind(
                null,
                updateDeviceProps,
                'darkMode'
              )}
            />
          </Pressable>

          <Separator />

          {biometrics.supported && (
            <>
              <ListHeader
                title={I18n.t('screens:settings.sections.authentication')}
              />

              <Pressable
                disabled={!biometrics.active}
                onPress={disableBiometrics.bind(
                  null,
                  biometricDisable,
                  !biometrics.active
                )}
                style={style.pressableRow}>
                <ColumnView flex={1} alignItems={'flex-start'}>
                  <Text.List color={colors.inputSecondary}>
                    {I18n.t('screens:home.biometrics.login')}
                  </Text.List>
                  <Text.Caption color={colors.inputSecondary}>
                    {I18n.t('screens:settings.switches.biometricsDisabled')}
                  </Text.Caption>
                </ColumnView>
                <Switch
                  value={biometrics.active}
                  onValueChange={disableBiometrics.bind(null, biometricDisable)}
                  disabled={!biometrics.active}
                />
              </Pressable>

              <Separator />
            </>
          )}

          <ListHeader title={I18n.t('screens:settings.sections.general')} />

          <ListItem
            onPress={openTerms.bind(null, { updateInAppBrowserProps })}
            rightIcon={'chevron-right'}
            title={I18n.t('screens:settings.links.tos')}
          />

          <Separator />
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

Settings.propTypes = {
  autoOpenStopDetails: PropTypes.bool,
  autoSelectStop: PropTypes.bool,
  biometricDisable: PropTypes.func,
  biometrics: PropTypes.object,
  buttonAccessibility: PropTypes.number,
  checklist: PropTypes.object,
  computeDirections: PropTypes.bool,
  computeShortDirections: PropTypes.bool,
  continueDelivering: PropTypes.func,
  countDown: PropTypes.bool,
  currentLocation: PropTypes.object,
  darkMode: PropTypes.bool,
  foregroundSize: PropTypes.string,
  isOptimised: PropTypes.bool,
  language: PropTypes.string,
  largerDeliveryText: PropTypes.bool,
  mapMarkerSize: PropTypes.number,
  optimisedStopsToShow: PropTypes.number,
  setLanguage: PropTypes.func,
  showAllPendingStops: PropTypes.bool,
  showDoneDeliveries: PropTypes.bool,
  showMapControlsOnMovement: PropTypes.bool,
  status: PropTypes.string,
  updateDeviceProps: PropTypes.func,
  updateInAppBrowserProps: PropTypes.func,
  vibrate: PropTypes.bool
};

Settings.defaultProps = {};

export default Settings;
