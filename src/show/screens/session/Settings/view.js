import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import Vibration from 'Services/vibration';
import { colors, defaults, sizes } from 'Theme';
import NavigationService from 'Navigation/service';
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

const onShowDoneDeliveries = (updateDeviceProps, showDoneDeliveries) => {
  updateDeviceProps({ showDoneDeliveries });
};

const onOptimization = (
  { updateDeliveryProps, optimizeStops, currentLocation, returnPosition },
  optimizedRoutes
) => {
  updateDeliveryProps({ optimizedRoutes: !optimizedRoutes });
  if (!optimizedRoutes) {
    optimizeStops({ currentLocation, returnPosition });
  }
};

const Settings = (props) => {
  const {
    buttonAccessibility,
    currentLocation,
    foregroundSize,
    logout,
    mapMarkerSize,
    optimizedRoutes,
    optimizeStops,
    returnPosition,
    showDoneDeliveries,
    updateDeliveryProps,
    updateDeviceProps,
    vibrate
  } = props;

  return (
    <SafeAreaView top bottom>
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
          flex={1}
          justifyContent={'flex-start'}
          alignItems={'stretch'}
          width={'auto'}>
          <ListHeader title={I18n.t('screens:settings.sections.routing')} />

          <RowView
            marginHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}
            marginVertical={defaults.marginVertical / 2}
            width={'auto'}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:settings.switches.manualRouting')}
            </Text.List>
            <Switch
              value={!optimizedRoutes}
              onValueChange={onOptimization.bind(null, {
                optimizeStops,
                currentLocation,
                returnPosition,
                updateDeliveryProps
              })}
            />
          </RowView>

          <Separator />

          <ListHeader title={I18n.t('screens:settings.sections.map')} />

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
              onValueChange={onShowDoneDeliveries.bind(null, updateDeviceProps)}
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

          <Separator marginLeft={defaults.marginHorizontal} />

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
        </ColumnView>
        <RowView
          alignItems={'stretch'}
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}
          marginVertical={defaults.marginVertical}>
          <Button.Error title={I18n.t('general:logout')} onPress={logout} />
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

Settings.propTypes = {
  buttonAccessibility: PropTypes.number,
  currentLocation: PropTypes.object,
  foregroundSize: PropTypes.string,
  logout: PropTypes.func,
  mapMarkerSize: PropTypes.number,
  optimizedRoutes: PropTypes.bool,
  optimizeStops: PropTypes.func,
  returnPosition: PropTypes.object,
  showDoneDeliveries: PropTypes.bool,
  updateDeliveryProps: PropTypes.func,
  updateDeviceProps: PropTypes.func,
  vibrate: PropTypes.bool
};

Settings.defaultProps = {};

export default Settings;
