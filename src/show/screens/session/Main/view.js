import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { NavigationEvents } from 'react-navigation';
import { Animated, PanResponder, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes } from 'Theme';
import { ColumnView } from 'Containers';
import NavigationService from 'Navigation/service';
import { deviceFrame, statusBarHeight } from 'Helpers';
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

const mainForegroundAction = ({
  deliveryStatus,
  foregroundPaddingTop,
  optimizedRoutes,
  optimizeStops,
  pullHandlePan,
  pullHandleMoveY,
  snapTopY,
  selectedStop,
  startDelivering,
  top
}) => {
  switch (deliveryStatus) {
    case 0:
      springForeground({
        animatedValues: [pullHandlePan.y, pullHandleMoveY],
        toValue: snapTopY,
        snapTopY,
        pullHandleMoveY,
        foregroundPaddingTop,
        routeName: 'CheckIn',
        top
      });
      break;
    case 1:
      startDelivering();
      break;
    case 2:
      if (selectedStop) {
        springForeground({
          animatedValues: [pullHandlePan.y, pullHandleMoveY],
          toValue: snapTopY,
          snapTopY,
          pullHandleMoveY,
          foregroundPaddingTop,
          routeName: 'Deliver',
          top
        });
      } else if (!optimizedRoutes) {
        optimizeStops();
      }
      break;
  }
};

const springForeground = ({
  animatedValues,
  toValue,
  snapTopY,
  pullHandleMoveY,
  foregroundPaddingTop,
  routeName,
  top
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
    Animated.spring(foregroundPaddingTop, {
      toValue: 0,
      bounciness: 0,
      useNativeDriver: false
    }).start();
  }
};

const triggerNavigation = (routeName) => {
  NavigationService.navigate({ routeName });
};

const Main = (props) => {
  const {
    buttonAccessibility,
    canPanForeground,
    deliveryStatus,
    optimizedRoutes,
    selectedStop,
    optimizeStops,
    startDelivering
  } = props;

  const [foregroundTitleHeight, setForegroundTitleHeight] = useState(0);
  const { top, bottom } = useSafeAreaInsets();
  const { height, width } = deviceFrame();
  const bottomMapPadding = configuration.navigation.height + bottom;

  const snapBottomY =
    height -
    bottom -
    configuration.navigation.height -
    configuration.foreground.defaultHeight -
    buttonAccessibility;
  const snapTopY = top;

  const interpolations = {
    buttonTitleColor: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [colors.secondary, colors.white],
      extrapolate: 'clamp'
    },
    foregroundDetailsOpacity: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [configuration.opacity.min, configuration.opacity.max],
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
      ], // button transition to title top
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
          buttonAccessibility
      ],
      outputRange: [44, width],
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
      const middleY = height / 2;
      let toValue = null;

      if (Math.abs(vy) < 0.05) {
        if (moveY < middleY) {
          toValue = snapTopY;
        } else {
          toValue = snapBottomY;
        }
      } else {
        toValue = vy < 0 ? snapTopY : snapBottomY;
      }

      springForeground({
        animatedValues: [pullHandlePan.y, pullHandleMoveY],
        toValue,
        snapTopY,
        pullHandleMoveY,
        foregroundPaddingTop,
        routeName: deliveryStatus === 2 ? 'Deliver' : 'CheckIn',
        top
      });
      currentLocationY = 0;
    }
  });

  const interpolatedValues = {
    buttonTitleColor: pullHandleMoveY.interpolate(
      interpolations.buttonTitleColor
    ),
    foregroundDetailsOpacity: pullHandleMoveY.interpolate(
      interpolations.foregroundDetailsOpacity
    ),
    foregroundActionTop: pullHandleMoveY.interpolate(
      interpolations.foregroundActionTop
    ),
    foregroundHeight: pullHandleMoveY.interpolate(
      interpolations.foregroundHeight
    ),
    navigationY: pullHandleMoveY.interpolate(interpolations.navigationY),
    pullHandleWidth: pullHandleMoveY.interpolate(
      interpolations.pullHandleWidth
    ),
    searchY: pullHandleMoveY.interpolate(interpolations.searchY),
    topBorderRadius: pullHandleMoveY.interpolate(interpolations.topBorderRadius)
  };

  return (
    <ColumnView flex={1} justifyContent={'flex-start'}>
      <Search panY={interpolatedValues.searchY} />
      <NavigationEvents
        onWillFocus={setTimeout.bind(
          null,
          springForeground.bind(null, {
            animatedValues: [pullHandlePan.y, pullHandleMoveY],
            toValue: snapBottomY,
            snapTopY,
            pullHandleMoveY,
            foregroundPaddingTop,
            top
          }),
          150
        )}
      />
      <Map
        mapPadding={{
          bottom: bottomMapPadding
        }}
        height={height - bottomMapPadding}
      />

      <Foreground
        pullHandleMoveY={pullHandleMoveY}
        height={interpolatedValues.foregroundHeight}
        paddingTop={foregroundPaddingTop}
        paddingBottom={configuration.navigation.height + bottom}
        topBorderRadius={interpolatedValues.topBorderRadius}>
        <PullHandle
          pullHandlePanResponder={pullHandlePanResponder}
          width={interpolatedValues.pullHandleWidth}
        />
        <ForegroundContent
          onTitleLayoutChange={setForegroundTitleHeight}
          interpolatedValues={interpolatedValues}
          onButtonPress={mainForegroundAction.bind(null, {
            deliveryStatus,
            foregroundPaddingTop,
            optimizedRoutes,
            optimizeStops,
            pullHandlePan,
            pullHandleMoveY,
            snapTopY,
            selectedStop,
            startDelivering,
            top
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
  deliveryStatus: PropTypes.number,
  optimizedRoutes: PropTypes.bool,
  selectedStop: PropTypes.any,
  optimizeStops: PropTypes.func,
  startDelivering: PropTypes.func
};

Main.defaultProps = {
  canPanForeground: false,
  deliveryStatus: 0
};

export default Main;
