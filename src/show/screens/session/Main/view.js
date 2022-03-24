import React from 'react';
import PropTypes from 'prop-types';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { deliveryStates as DS } from 'Helpers';
import NavigationService from 'Services/navigation';
import Analytics, { EVENTS } from 'Services/analytics';
import { ColumnView, SafeAreaView, useTheme } from 'Containers';

import { ForegroundContent, Navigation, Map, Search } from './subviews';

const mainForegroundAction = ({
  autoSelectStop,
  checklist,
  continueDelivering,
  isOptimised,
  selectedStop,
  status,
  startDelivering,
  updateDeviceProps
}) => {
  switch (status) {
    case DS.NCI:
    case DS.LV:
    case DS.SSC:
      if (checklist.loadedVan && checklist.shiftStartVanChecks) {
        if (isOptimised && autoSelectStop) {
          continueDelivering();
        } else {
          startDelivering();
        }
      } else {
        NavigationService.navigate({ routeName: 'CheckIn' });
      }

      break;
    case DS.DELC:
    case DS.SEC:
      if (selectedStop) {
        NavigationService.navigate({ routeName: 'Deliver' });
      } else {
        NavigationService.navigate({ routeName: 'CheckIn' });
      }
      break;
    case DS.DEL:
      if (selectedStop) {
        NavigationService.navigate({ routeName: 'Deliver' });
      } else {
        // this action is available only when the route is optimised
        // foreground content disables the button otherwise
        updateDeviceProps({ autoSelectStop: true });
        continueDelivering();
      }
      break;
  }
  Analytics.trackEvent(EVENTS.MAIN_FOREGROUND_ACTION);
};

const Main = props => {
  const { colors } = useTheme();
  const {
    autoSelectStop,
    checklist,
    continueDelivering,
    isOptimised,
    navigation,
    selectedStop,
    status,
    startDelivering,
    updateDeviceProps
  } = props;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  return (
    <SafeAreaView top={false}>
      <ColumnView flex={1} justifyContent={'flex-start'}>
        <Search />

        <ColumnView flex={1}>
          <Map />
        </ColumnView>
        <ColumnView>
          <ColumnView backgroundColor={colors.white}>
            <ForegroundContent
              onButtonPress={mainForegroundAction.bind(null, {
                autoSelectStop,
                checklist,
                continueDelivering,
                isOptimised,
                selectedStop,
                status,
                startDelivering,
                updateDeviceProps
              })}
            />
          </ColumnView>

          <Navigation openDrawer={navigation.openDrawer} />
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

Main.propTypes = {
  autoSelectStop: PropTypes.bool,
  checklist: PropTypes.object,
  continueDelivering: PropTypes.func,
  navigation: PropTypes.func,
  isOptimised: PropTypes.bool,
  selectedStop: PropTypes.any,
  status: PropTypes.string,
  startDelivering: PropTypes.func,
  updateDeviceProps: PropTypes.func
};

Main.defaultProps = {
  status: DS.NCI
};

export default Main;
