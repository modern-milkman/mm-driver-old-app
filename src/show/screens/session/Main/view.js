import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationEvents } from 'react-navigation';
import CompassHeading from 'react-native-compass-heading';
import { Animated, PanResponder, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ColumnView } from 'Containers';
import { deliveryStates as DS } from 'Helpers';
import { colors, defaults, sizes } from 'Theme';
import NavigationService from 'Navigation/service';
import {
  customerSatisfactionColor,
  deviceFrame,
  statusBarHeight
} from 'Helpers';

import { height as textInputHeight } from 'Components/TextInput';

import { configuration } from './helpers';
import {
  Foreground,
  ForegroundContent,
  Navigation,
  Map,
  PullHandle,
  Search
} from './subviews';

const compassStarted = React.createRef(false);

const mainForegroundAction = ({
  checklist,
  continueDelivering,
  currentLocation,
  foregroundPaddingTop,
  optimisedRouting,
  pullHandleMoveY,
  pullHandlePan,
  selectedStop,
  snapMiddleY,
  snapTopY,
  status,
  startDelivering,
  top,
  updateDeviceProps
}) => {
  switch (status) {
    case DS.NCI:
    case DS.LV:
    case DS.SSC:
      if (checklist.loadedVan && checklist.shiftStartVanChecks) {
        if (optimisedRouting) {
          continueDelivering();
        } else {
          startDelivering();
        }
      } else {
        springForeground({
          animatedValues: [pullHandlePan.y, pullHandleMoveY],
          toValue: snapTopY,
          snapMiddleY,
          snapTopY,
          pullHandleMoveY,
          foregroundPaddingTop,
          routeName: 'CheckIn',
          top,
          updateDeviceProps
        });
      }

      break;
    case DS.DELC:
    case DS.SEC:
      if (selectedStop) {
        springForeground({
          animatedValues: [pullHandlePan.y, pullHandleMoveY],
          toValue: snapTopY,
          snapMiddleY,
          snapTopY,
          pullHandleMoveY,
          foregroundPaddingTop,
          routeName: 'Deliver',
          top,
          updateDeviceProps
        });
      } else {
        springForeground({
          animatedValues: [pullHandlePan.y, pullHandleMoveY],
          toValue: snapTopY,
          snapMiddleY,
          snapTopY,
          pullHandleMoveY,
          foregroundPaddingTop,
          routeName: 'CheckIn',
          top,
          updateDeviceProps
        });
      }
      break;
    case DS.DEL:
      if (selectedStop) {
        springForeground({
          animatedValues: [pullHandlePan.y, pullHandleMoveY],
          toValue: snapTopY,
          snapMiddleY,
          snapTopY,
          pullHandleMoveY,
          foregroundPaddingTop,
          routeName: 'Deliver',
          top,
          updateDeviceProps
        });
      } else {
        // this action is available only when the route is optimised
        // foreground content disables the button otherwise
        continueDelivering();
      }
      break;
  }
};

const springForeground = ({
  animatedValues,
  toValue,
  snapMiddleY,
  snapTopY,
  pullHandleMoveY,
  foregroundPaddingTop,
  routeName,
  top,
  updateDeviceProps
}) => {
  Animated.parallel([
    Animated.spring(animatedValues[0], {
      toValue,
      bounciness: 4,
      useNativeDriver: false
    }),
    Animated.spring(animatedValues[1], {
      toValue,
      bounciness: 4,
      useNativeDriver: false
    })
  ]).start();
  if (toValue === snapTopY) {
    Animated.parallel([
      Animated.timing(pullHandleMoveY, {
        toValue: 0,
        useNativeDriver: false,
        duration: 125
      }),
      Animated.timing(foregroundPaddingTop, {
        toValue: top,
        useNativeDriver: false,
        duration: 125
      })
    ]).start();
    setTimeout(triggerNavigation.bind(null, routeName), 150);
  } else {
    updateDeviceProps({
      foregroundSize: toValue === snapMiddleY ? 'large' : 'small'
    });

    Animated.spring(foregroundPaddingTop, {
      toValue: 0,
      bounciness: 0,
      useNativeDriver: false
    }).start();
  }
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

const triggerNavigation = routeName => {
  NavigationService.navigate({ routeName });
};

const Main = props => {
  const {
    buttonAccessibility,
    canPanForeground,
    checklist,
    continueDelivering,
    currentLocation,
    foregroundSize,
    optimisedRouting,
    selectedStop,
    setLocationHeading,
    status,
    startDelivering,
    updateDeviceProps
  } = props;
  const { height, width } = deviceFrame();
  const currentSpeed = currentLocation ? currentLocation.speed : null;

  const [foregroundTitleHeight, setForegroundTitleHeight] = useState(0);
  const { top, bottom } = useSafeAreaInsets();
  const bottomMapPadding = configuration.navigation.height + bottom;

  const snapBottomY =
    height - bottom - configuration.navigation.height - buttonAccessibility;
  const snapMiddleY =
    height -
    bottom -
    configuration.navigation.height -
    configuration.foreground.defaultHeight -
    buttonAccessibility;
  const snapTopY = top;
  const middleY = height / 2;
  const middleBottomY = snapMiddleY + (snapBottomY - snapMiddleY) / 2;

  const interpolations = {
    buttonTitleColor: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [colors.secondary, colors.white],
      extrapolate: 'clamp'
    },
    fabTop: {
      inputRange: [0, snapMiddleY, snapBottomY],
      outputRange: [0, 0, configuration.foreground.defaultHeight],
      extrapolate: 'clamp'
    },
    foregroundBackgroundColor: {
      inputRange: [0, snapMiddleY, snapBottomY],
      outputRange: [
        colors.neutral,
        colors.neutral,
        customerSatisfactionColor(selectedStop?.satisfactionStatus || 0)
      ],
      extrapolate: 'clamp'
    },
    foregroundDetailsIconsOpacity: {
      inputRange: [snapMiddleY, snapBottomY],
      outputRange: [configuration.opacity.min, configuration.opacity.max],
      extrapolate: 'clamp'
    },
    foregroundDetailsTopOpacity: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold,
        snapMiddleY,
        snapBottomY
      ],
      outputRange: [
        configuration.opacity.min,
        configuration.opacity.max,
        configuration.opacity.max,
        configuration.opacity.min
      ],
      extrapolate: 'clamp'
    },
    foregroundDetailsTitleOpacity: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [configuration.opacity.min, configuration.opacity.max],
      extrapolate: 'clamp'
    },
    foregroundDetailsTitleWidth: {
      inputRange: [0, snapMiddleY, middleBottomY],
      outputRange: [
        width - defaults.marginHorizontal * 2,
        width - defaults.marginHorizontal * 2,
        width - sizes.button.small * 2 - defaults.marginHorizontal * 2
      ],
      extrapolate: 'clamp'
    },
    foregroundActionTop: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [
        (Platform.OS === 'ios' ? -62 : -66) +
          (buttonAccessibility === sizes.button.small
            ? 5
            : buttonAccessibility === sizes.button.large
            ? -5
            : 0) -
          foregroundTitleHeight,
        0
      ],
      extrapolate: 'clamp'
    },
    foregroundHeight: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold,
        height -
          bottom -
          configuration.navigation.height -
          configuration.foreground.defaultHeight -
          buttonAccessibility
      ],
      outputRange: [
        height,
        height -
          top -
          bottom -
          configuration.navigation.height +
          (Platform.OS === 'android' ? statusBarHeight() : 0),
        configuration.foreground.defaultHeight +
          buttonAccessibility +
          (Platform.OS === 'android' ? statusBarHeight() : 0)
      ],
      extrapolate: 'clamp'
    },
    foregroundTitleColor: {
      inputRange: [0, snapMiddleY, snapBottomY],
      outputRange: [colors.secondary, colors.secondary, colors.white],
      extrapolate: 'clamp'
    },
    foregroundTitleTop: {
      inputRange: [0, snapMiddleY, snapBottomY],
      outputRange: [0, 0, -defaults.marginVertical / 2], // button transition to title top
      extrapolate: 'clamp'
    },
    navigationY: {
      inputRange: [
        top + configuration.foreground.collapseBackThreshold,
        height -
          bottom -
          configuration.navigation.height -
          configuration.foreground.defaultHeight -
          buttonAccessibility
      ],
      outputRange: [
        bottom + configuration.navigation.height,
        Platform.OS === 'android' ? -statusBarHeight() : 0
      ],
      extrapolate: 'clamp'
    },
    pullHandleWidth: {
      inputRange: [
        top + configuration.foreground.collapseBackThreshold,
        height -
          bottom -
          configuration.navigation.height -
          configuration.foreground.defaultHeight -
          buttonAccessibility,
        snapMiddleY,
        snapBottomY
      ],
      outputRange: [0, width, width, 0],
      extrapolate: 'clamp'
    },
    searchY: {
      inputRange: [
        top + configuration.foreground.collapseBackThreshold,
        height -
          bottom -
          configuration.navigation.height -
          configuration.foreground.defaultHeight -
          buttonAccessibility
      ],
      outputRange: [-top - textInputHeight('normal'), 0],
      extrapolate: 'clamp'
    },
    topBorderRadius: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [
        configuration.topBorderRadius.min,
        configuration.topBorderRadius.max
      ],
      extrapolate: 'clamp'
    }
  };

  let currentLocationY = 0;

  const foregroundPaddingTop = useRef(new Animated.Value(0)).current;
  const pullHandleMoveY = useRef(
    new Animated.Value(
      height -
        bottom -
        configuration.navigation.height -
        configuration.foreground.defaultHeight -
        buttonAccessibility
    )
  ).current;
  const pullHandlePan = useRef(
    new Animated.ValueXY({
      x: 0,
      y:
        height -
        bottom -
        configuration.navigation.height -
        configuration.foreground.defaultHeight -
        buttonAccessibility
    })
  ).current;
  const pullHandlePanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => canPanForeground,
    onPanResponderGrant: (e, gestureState) => {
      currentLocationY = e.nativeEvent.locationY;
      pullHandlePan.setOffset({
        y: pullHandlePan.y._value + currentLocationY
      });
    },
    onPanResponderMove: (e, { dy, moveY }) => {
      Animated.event([null, { dy: pullHandlePan.y, moveY: pullHandleMoveY }], {
        useNativeDriver: false
      })(e, { dy, moveY: moveY - currentLocationY });
    },
    onPanResponderRelease: (e, { vy, moveY, ...rest }) => {
      pullHandlePan.flattenOffset();
      let toValue = null;

      if (Math.abs(vy) < 0.1) {
        if (moveY < middleY) {
          toValue = snapTopY;
        } else if (moveY > middleBottomY) {
          toValue = snapBottomY;
        } else {
          toValue = snapMiddleY;
        }
      } else {
        toValue =
          vy < 0 ? snapTopY : moveY > middleBottomY ? snapBottomY : snapMiddleY;
      }

      springForeground({
        animatedValues: [pullHandlePan.y, pullHandleMoveY],
        toValue,
        snapMiddleY,
        snapTopY,
        pullHandleMoveY,
        foregroundPaddingTop,
        routeName: status === DS.DEL ? 'Deliver' : 'CheckIn',
        top,
        updateDeviceProps
      });
      currentLocationY = 0;
    }
  });

  const interpolatedValues = {
    buttonTitleColor: pullHandleMoveY.interpolate(
      interpolations.buttonTitleColor
    ),
    fabTop: pullHandleMoveY.interpolate(interpolations.fabTop),
    foregroundBackgroundColor: pullHandleMoveY.interpolate(
      interpolations.foregroundBackgroundColor
    ),
    foregroundDetailsIconsOpacity: pullHandleMoveY.interpolate(
      interpolations.foregroundDetailsIconsOpacity
    ),
    foregroundDetailsTitleOpacity: pullHandleMoveY.interpolate(
      interpolations.foregroundDetailsTitleOpacity
    ),
    foregroundDetailsTitleWidth: pullHandleMoveY.interpolate(
      interpolations.foregroundDetailsTitleWidth
    ),
    foregroundDetailsTopOpacity: pullHandleMoveY.interpolate(
      interpolations.foregroundDetailsTopOpacity
    ),
    foregroundActionTop: pullHandleMoveY.interpolate(
      interpolations.foregroundActionTop
    ),
    foregroundHeight: pullHandleMoveY.interpolate(
      interpolations.foregroundHeight
    ),
    foregroundTitleColor: pullHandleMoveY.interpolate(
      interpolations.foregroundTitleColor
    ),
    foregroundTitleTop: pullHandleMoveY.interpolate(
      interpolations.foregroundTitleTop
    ),
    navigationY: pullHandleMoveY.interpolate(interpolations.navigationY),
    pullHandleWidth: pullHandleMoveY.interpolate(
      interpolations.pullHandleWidth
    ),
    searchY: pullHandleMoveY.interpolate(interpolations.searchY),
    topBorderRadius: pullHandleMoveY.interpolate(interpolations.topBorderRadius)
  };

  useEffect(() => {
    if (currentSpeed < 2.5 && !compassStarted.current) {
      toggleCompass(true, setLocationHeading);
    } else {
      toggleCompass(false);
    }
  }, [currentSpeed, setLocationHeading]);

  return (
    <ColumnView flex={1} justifyContent={'flex-start'}>
      <Search panY={interpolatedValues.searchY} />
      <NavigationEvents
        onDidFocus={() => {
          if (currentSpeed < 2.5 && !compassStarted.current) {
            toggleCompass(true, setLocationHeading);
          }
        }}
        onDidBlur={toggleCompass.bind(null, false)}
        onWillFocus={setTimeout.bind(
          null,
          springForeground.bind(null, {
            animatedValues: [pullHandlePan.y, pullHandleMoveY],
            toValue: foregroundSize === 'large' ? snapMiddleY : snapBottomY,
            snapMiddleY,
            snapTopY,
            pullHandleMoveY,
            foregroundPaddingTop,
            top,
            updateDeviceProps
          }),
          150
        )}
      />
      <Map
        mapPadding={{
          bottom: bottomMapPadding
        }}
        height={height - bottomMapPadding}
        fabTop={interpolatedValues.fabTop}
      />

      <Foreground
        pullHandleMoveY={pullHandleMoveY}
        height={interpolatedValues.foregroundHeight}
        paddingTop={foregroundPaddingTop}
        paddingBottom={configuration.navigation.height + bottom}
        topBorderRadius={interpolatedValues.topBorderRadius}
        backgroundColor={interpolatedValues.foregroundBackgroundColor}>
        <PullHandle
          pullHandlePanResponder={pullHandlePanResponder}
          width={interpolatedValues.pullHandleWidth}
        />
        <ForegroundContent
          buttonTitleColor={interpolatedValues.buttonTitleColor}
          foregroundActionTop={interpolatedValues.foregroundActionTop}
          foregroundDetailsIconsOpacity={
            interpolatedValues.foregroundDetailsIconsOpacity
          }
          foregroundDetailsTitleOpacity={
            interpolatedValues.foregroundDetailsTitleOpacity
          }
          foregroundDetailsTitleWidth={
            interpolatedValues.foregroundDetailsTitleWidth
          }
          foregroundDetailsTopOpacity={
            interpolatedValues.foregroundDetailsTopOpacity
          }
          foregroundTitleColor={interpolatedValues.foregroundTitleColor}
          foregroundTitleTop={interpolatedValues.foregroundTitleTop}
          onTitleLayoutChange={setForegroundTitleHeight}
          onButtonPress={mainForegroundAction.bind(null, {
            checklist,
            continueDelivering,
            currentLocation,
            foregroundPaddingTop,
            optimisedRouting,
            pullHandleMoveY,
            pullHandlePan,
            selectedStop,
            snapMiddleY,
            snapTopY,
            status,
            startDelivering,
            top,
            updateDeviceProps
          })}
          onChevronUpPress={springForeground.bind(null, {
            animatedValues: [pullHandlePan.y, pullHandleMoveY],
            toValue: snapMiddleY,
            snapMiddleY,
            snapTopY,
            pullHandleMoveY,
            foregroundPaddingTop,
            top,
            updateDeviceProps
          })}
        />
      </Foreground>
      <Navigation
        panY={interpolatedValues.navigationY}
        paddingBottom={bottom}
      />
    </ColumnView>
  );
};

Main.propTypes = {
  buttonAccessibility: PropTypes.number,
  canPanForeground: PropTypes.bool,
  checklist: PropTypes.object,
  continueDelivering: PropTypes.func,
  currentLocation: PropTypes.object,
  foregroundSize: PropTypes.string,
  optimisedRouting: PropTypes.bool,
  selectedStop: PropTypes.any,
  setLocationHeading: PropTypes.func,
  status: PropTypes.string,
  startDelivering: PropTypes.func,
  updateDeviceProps: PropTypes.func
};

Main.defaultProps = {
  canPanForeground: false,
  status: DS.NCI
};

export default Main;
