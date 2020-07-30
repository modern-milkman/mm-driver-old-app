import React from 'react';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deviceFrame } from 'Helpers';
import { FullView } from 'Containers';

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
      Animated.spring(pullHandleMoveY, {
        toValue: 0,
        bounciness: 0,
        useNativeDriver: false
      }),
      Animated.spring(foregroundPaddingTop, {
        toValue: top,
        bounciness: 0,
        useNativeDriver: false
      })
    ]).start();
  } else {
    Animated.spring(foregroundPaddingTop, {
      toValue: 0,
      bounciness: 0,
      useNativeDriver: false
    }).start();
  }
};

const Main = (props) => {
  const {
    availableNavApps,
    coords: { longitude, latitude }
  } = props;
  const { top, bottom } = useSafeAreaInsets();
  const { height } = deviceFrame();
  const snapBottomY =
    height -
    bottom -
    configuration.navigation.height -
    configuration.foreground.defaultHeight;
  const snapTopY = top;

  const interpolations = {
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
    },
    chevronDownOpacity: {
      inputRange: [
        top + configuration.navigation.height,
        top + configuration.foreground.collapseBackThreshold
      ],
      outputRange: [configuration.opacity.max, configuration.opacity.min],
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
    onMoveShouldSetPanResponder: () => true,
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
    navigationY: pullHandleMoveY.interpolate(interpolations.navigationY),
    foregroundHeight: pullHandleMoveY.interpolate(
      interpolations.foregroundHeight
    ),
    topBorderRadius: pullHandleMoveY.interpolate(
      interpolations.topBorderRadius
    ),
    chevronDownOpacity: pullHandleMoveY.interpolate(
      interpolations.chevronDownOpacity
    )
  };

  return (
    <FullView>
      <Map
        latitude={latitude}
        longitude={longitude}
        mapPadding={{
          bottom:
            configuration.navigation.height +
            configuration.foreground.defaultHeight +
            configuration.topBorderRadius.max
        }}
        height={height + 25}
        availableNavApps={availableNavApps}
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
        />
      </Foreground>
      <Navigation
        panY={interpolatedValues.navigationY}
        paddingBottom={bottom}
      />
    </FullView>
  );
};

Main.propTypes = {
  availableNavApps: PropTypes.array,
  coords: PropTypes.object
};

Main.defaultProps = {
  availableNavApps: [],
  coords: {
    latitude: parseFloat(Config.DEFAULT_LATITUDE),
    longitude: parseFloat(Config.DEFAULT_LONGITUDE)
  }
};

export default Main;
