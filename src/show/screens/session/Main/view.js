import React from 'react';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { NavigationEvents } from 'react-navigation';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from 'Theme';
import { deviceFrame } from 'Helpers';
import { Button, Text } from 'Components';
import { ColumnView, FullView } from 'Containers';
import NavigationService from 'Navigation/service';

import I18n from 'Locales/I18n';

import { configuration } from './helpers';
import { Foreground, Navigation, Map, PullHandle } from './subviews';

const springForeground = ({
  animatedValues,
  toValue,
  snapTopY,
  pullHandleMoveY,
  foregroundPaddingTop,
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
    setTimeout(triggerNavigation, 150);
  } else {
    Animated.spring(foregroundPaddingTop, {
      toValue: 0,
      bounciness: 0,
      useNativeDriver: false
    }).start();
  }
};

const triggerNavigation = () => {
  NavigationService.navigate({ routeName: 'CheckIn' });
};

const Main = (props) => {
  const {
    deliveryStatus,
    hasItemsLeftToDeliver,
    hasRoutes,
    itemCount,
    proccessing,
    routeDescription
  } = props;
  const { top, bottom } = useSafeAreaInsets();
  const { height, width } = deviceFrame();
  const snapBottomY =
    height -
    bottom -
    configuration.navigation.height -
    configuration.foreground.defaultHeight;
  const snapTopY = top;
  const hourNow = new Date().getHours();

  const interpolations = {
    chevronDownOpacity: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [configuration.opacity.max, configuration.opacity.min],
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
      outputRange: [Platform.OS === 'ios' ? -72 : -68, 0],
      extrapolate: 'clamp'
    },
    foregroundHeight: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold,
        height -
          bottom -
          configuration.navigation.height -
          configuration.foreground.defaultHeight
      ],
      outputRange: [
        height,
        height - top - bottom - configuration.navigation.height,
        configuration.foreground.defaultHeight
      ],
      extrapolate: 'clamp'
    },
    navigationY: {
      inputRange: [
        top + configuration.foreground.collapseBackThreshold,
        height -
          bottom -
          configuration.navigation.height -
          configuration.foreground.defaultHeight
      ],
      outputRange: [bottom + configuration.navigation.height, 0],
      extrapolate: 'clamp'
    },
    pullHandleWidth: {
      inputRange: [
        top + configuration.foreground.collapseBackThreshold,
        height -
          bottom -
          configuration.navigation.height -
          configuration.foreground.defaultHeight
      ],
      outputRange: [44, width],
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
  const foregroundPaddingTop = new Animated.Value(0);
  const pullHandleMoveY = new Animated.Value(
    height -
      bottom -
      configuration.navigation.height -
      configuration.foreground.defaultHeight
  );
  const pullHandlePan = new Animated.ValueXY({
    x: 0,
    y:
      height -
      bottom -
      configuration.navigation.height -
      configuration.foreground.defaultHeight
  });
  const pullHandlePanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => hasRoutes,
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
        top
      });
      currentLocationY = 0;
    }
  });

  const interpolatedValues = {
    chevronDownOpacity: pullHandleMoveY.interpolate(
      interpolations.chevronDownOpacity
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
    topBorderRadius: pullHandleMoveY.interpolate(interpolations.topBorderRadius)
  };

  return (
    <FullView>
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
          bottom:
            configuration.navigation.height +
            configuration.foreground.defaultHeight +
            configuration.topBorderRadius.max +
            bottom
        }}
        height={height + 25}
      />

      <Foreground
        pullHandleMoveY={pullHandleMoveY}
        height={interpolatedValues.foregroundHeight}
        paddingTop={foregroundPaddingTop}
        paddingBottom={configuration.navigation.height + bottom}
        topBorderRadius={interpolatedValues.topBorderRadius}>
        <PullHandle
          chevronDownOnPress={springForeground.bind(null, {
            animatedValues: [pullHandlePan.y, pullHandleMoveY],
            toValue: snapBottomY,
            snapTopY,
            pullHandleMoveY,
            foregroundPaddingTop,
            top
          })}
          chevronDownOpacity={interpolatedValues.chevronDownOpacity}
          pullHandlePanResponder={pullHandlePanResponder}
          width={interpolatedValues.pullHandleWidth}
        />
        {proccessing ? (
          <ColumnView flex={1}>
            <ActivityIndicator />
          </ColumnView>
        ) : (
          <ColumnView>
            <Animated.View
              style={{ opacity: interpolatedValues.foregroundDetailsOpacity }}>
              <Text.Callout color={colors.black} align={'center'}>
                {deliveryStatus === 3
                  ? hourNow < Config.RESET_HOUR_DAY
                    ? I18n.t('screens:main.comeBackLaterTitle')
                    : I18n.t('screens:main.noDeliveryTitle')
                  : routeDescription}
              </Text.Callout>
              <Text.Caption
                color={colors.black}
                align={'center'}
                noMargin
                noPadding>
                {deliveryStatus === 3
                  ? hourNow < Config.RESET_HOUR_DAY
                    ? I18n.t('screens:main.comeBackLaterDesc')
                    : I18n.t('screens:main.noDeliveryDesc')
                  : I18n.t('screens:main.deliveryActiveDesc', {
                      itemCount
                    })}
              </Text.Caption>
            </Animated.View>
            <Animated.View
              style={{
                transform: [
                  { translateY: interpolatedValues.foregroundActionTop }
                ]
              }}>
              <Button.Primary
                title={
                  deliveryStatus === 0 || deliveryStatus === 3
                    ? I18n.t('screens:checkIn.checkIn')
                    : I18n.t('general:go')
                }
                disabled={deliveryStatus === 3}
                onPress={
                  deliveryStatus === 1 || deliveryStatus === 2
                    ? alert.bind(null, 'GO ACTION HERE!')
                    : springForeground.bind(null, {
                        animatedValues: [pullHandlePan.y, pullHandleMoveY],
                        toValue: snapTopY,
                        snapTopY,
                        pullHandleMoveY,
                        foregroundPaddingTop,
                        top
                      })
                }
                width={'70%'}
              />
            </Animated.View>
          </ColumnView>
        )}
      </Foreground>
      <Navigation
        panY={interpolatedValues.navigationY}
        paddingBottom={bottom}
      />
    </FullView>
  );
};

Main.propTypes = {
  proccessing: PropTypes.bool,
  hasRoutes: PropTypes.bool,
  deliveryStatus: PropTypes.bool,
  hasItemsLeftToDeliver: PropTypes.bool,
  itemCount: PropTypes.number,
  routeDescription: PropTypes.string
};

Main.defaultProps = {
  proccessing: true,
  hasRoutes: false,
  deliveryStatus: 0,
  hasItemsLeftToDeliver: false,
  itemCount: 0,
  routeDescription: ''
};

export default Main;
