import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import CompassHeading from 'react-native-compass-heading';

import { colors } from 'Theme';
import { deliveryStates as DS } from 'Helpers';
import NavigationService from 'Services/navigation';
import { ColumnView, SafeAreaView } from 'Containers';
import Analytics, { EVENTS } from 'Services/analytics';

import { ForegroundContent, Navigation, Map, Search } from './subviews';

const compassStarted = React.createRef(false);

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

const toggleCompass = (flag, callback) => {
  if (flag && !compassStarted.current) {
    compassStarted.current = true;
    CompassHeading.start(3, callback);
  } else if (compassStarted.current) {
    compassStarted.current = false;
    CompassHeading.stop();
  }
};

const Main = props => {
  const {
    autoSelectStop,
    checklist,
    continueDelivering,
    currentLocation,
    isOptimised,
    navigation,
    selectedStop,
    setLocationHeading,
    status,
    startDelivering,
    updateDeviceProps
  } = props;

  const currentSpeed = currentLocation ? currentLocation.speed : null;

  useEffect(() => {
    if (currentSpeed < 2.5 && !compassStarted.current) {
      toggleCompass(true, setLocationHeading);
    } else {
      toggleCompass(false);
    }

    const blurListener = navigation.addListener(
      'blur',
      toggleCompass.bind(null, false)
    );
    const focusListener = navigation.addListener('focus', () => {
      //DID FOCUS
      if (currentSpeed < 2.5 && !compassStarted.current) {
        toggleCompass(true, setLocationHeading);
      }
    });

    const unsubscribe = () => {
      blurListener();
      focusListener();
    };

    return unsubscribe;
  }, [currentSpeed, setLocationHeading, navigation]);

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
  currentLocation: PropTypes.object,
  navigation: PropTypes.func,
  isOptimised: PropTypes.bool,
  selectedStop: PropTypes.any,
  setLocationHeading: PropTypes.func,
  status: PropTypes.string,
  startDelivering: PropTypes.func,
  updateDeviceProps: PropTypes.func
};

Main.defaultProps = {
  status: DS.NCI
};

export default Main;
