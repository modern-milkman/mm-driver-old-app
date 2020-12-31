import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Animated, Pressable } from 'react-native';

import I18n from 'Locales/I18n';
import { ukTimeNow } from 'Helpers';
import { defaults, colors } from 'Theme';
import { ColumnView, RowView } from 'Containers';
import { Button, Icon, NavBar, Text, Separator } from 'Components';

import style from './style';

const renderButtonTitle = (foregroundState) => {
  switch (foregroundState) {
    case 'MANUAL':
      return I18n.t('screens:main.useOptimizedRouting');
    case 'CHECKIN':
    case 'NO_DELIVERIES':
    case 'COME_BACK_LATER':
      return I18n.t('screens:checkIn.checkIn');
    case 'START_ROUTE':
      return I18n.t('general:go');
    case 'DELIVERING':
      return I18n.t('general:details');
  }
};

const renderHeading = (foregroundState, { routeDescription, selectedStop }) => {
  switch (foregroundState) {
    case 'MANUAL':
      return I18n.t('screens:main.titles.selectNextStop');
    case 'COME_BACK_LATER':
      return I18n.t('screens:main.titles.comeBackLater');
    case 'NO_DELIVERIES':
      return I18n.t('screens:main.titles.noDelivery');
    case 'CHECKIN':
    case 'START_ROUTE':
      return routeDescription;
    case 'DELIVERING':
      return selectedStop.title;
  }
};

const renderRightIcon = () => (
  <Icon
    name={'alert-outline'}
    color={colors.white}
    size={defaults.topNavigation.iconSize}
    containerSize={defaults.topNavigation.height}
    disabled
  />
);

const renderSubHeading = (foregroundState, { stopCount, selectedStop }) => {
  switch (foregroundState) {
    case 'MANUAL':
      return I18n.t('screens:main.descriptions.or');
    case 'COME_BACK_LATER':
      return I18n.t('screens:main.descriptions.comeBackLater');
    case 'NO_DELIVERIES':
      return I18n.t('screens:main.descriptions.noDelivery');
    case 'CHECKIN':
    case 'START_ROUTE':
      return I18n.t('screens:main.descriptions.deliveryActive', {
        stopCount
      });
    case 'DELIVERING':
      return I18n.t('screens:main.activeDeliveryFor', {
        itemCount: selectedStop.itemCount
      });
  }
};

const onLayout = (onTitleLayoutChange, e) => {
  onTitleLayoutChange(e.nativeEvent.layout.height);
};

const ForegroundContent = (props) => {
  const {
    buttonTitleColor,
    deliveryStatus,
    foregroundActionTop,
    foregroundDetailsIconsOpacity,
    foregroundDetailsTitleOpacity,
    foregroundDetailsTopOpacity,
    foregroundTitleColor,
    foregroundTitleTop,
    foregroundSize,
    onButtonPress,
    onChevronUpPress,
    optimizedRoutes,
    processing,
    resetHourDay,
    stopCount,
    selectedStop,
    onTitleLayoutChange
  } = props;

  let foregroundState = 'COME_BACK_LATER';

  if (deliveryStatus === 0) {
    if (stopCount === 0) {
      // < handled by default version
      if (ukTimeNow(true) > resetHourDay) {
        foregroundState = 'NO_DELIVERIES';
      }
    } else {
      foregroundState = 'CHECKIN';
    }
  } else if (deliveryStatus === 1) {
    foregroundState = 'START_ROUTE';
  } else if (deliveryStatus === 2) {
    if (selectedStop) {
      foregroundState = 'DELIVERING';
    } else if (!optimizedRoutes) {
      foregroundState = 'MANUAL';
    }
  } else if (deliveryStatus === 3) {
    if (ukTimeNow(true) < resetHourDay) {
      foregroundState = 'COME_BACK_LATER';
    } else {
      foregroundState = 'NO_DELIVERIES';
    }
  }

  return (
    <>
      {processing ? (
        <ColumnView
          flex={1}
          justifyContent={foregroundSize === 'large' ? 'center' : 'flex-start'}>
          <RowView height={62}>
            <ActivityIndicator
              color={foregroundSize === 'large' ? colors.primary : colors.white}
            />
          </RowView>
        </ColumnView>
      ) : (
        <ColumnView marginTop={defaults.paddingHorizontal}>
          <ColumnView alignItems={'stretch'}>
            <RowView
              width={'auto'}
              animated
              animatedStyle={{
                opacity: foregroundDetailsTopOpacity
              }}>
              <Separator
                height={5}
                width={38}
                color={colors.inputDark}
                borderRadius={defaults.borderRadius}
              />
            </RowView>

            <RowView
              marginTop={defaults.marginVertical / 3}
              width={'auto'}
              onLayout={onLayout.bind(this, onTitleLayoutChange)}
              animated
              animatedStyle={{
                opacity: foregroundDetailsTitleOpacity,
                transform: [{ translateY: foregroundTitleTop }]
              }}>
              <Text.Heading color={foregroundTitleColor} align={'center'}>
                {renderHeading(foregroundState, props)}
              </Text.Heading>
              <Pressable
                onPress={onButtonPress}
                style={style.pressableContainer}
                disabled={['COME_BACK_LATER', 'NO_DELIVERIES'].includes(
                  foregroundState
                )}>
                <Animated.View
                  style={{
                    opacity: foregroundDetailsIconsOpacity
                  }}>
                  <NavBar
                    leftIcon={'chevron-up'}
                    leftIconColor={colors.white}
                    leftIconAction={onChevronUpPress}
                    title={''}
                    RightComponent={
                      [3, 4].includes(selectedStop?.satisfactionStatus) &&
                      renderRightIcon
                    }
                    marginHorizontal={defaults.marginHorizontal / 2}
                  />
                </Animated.View>
              </Pressable>
            </RowView>

            <RowView
              marginVertical={defaults.marginVertical / 3}
              width={'auto'}
              animated
              animatedStyle={{
                opacity: foregroundDetailsTopOpacity
              }}>
              <Text.Caption color={colors.secondaryLight} align={'center'}>
                {renderSubHeading(foregroundState, props)}
              </Text.Caption>
            </RowView>
          </ColumnView>

          <RowView
            paddingHorizontal={defaults.marginHorizontal}
            animated
            animatedStyle={{
              transform: [{ translateY: foregroundActionTop }]
            }}>
            <Button.Primary
              backgroundOpacity={foregroundDetailsTopOpacity}
              titleColor={buttonTitleColor}
              title={renderButtonTitle(foregroundState, props)}
              disabled={['COME_BACK_LATER', 'NO_DELIVERIES'].includes(
                foregroundState
              )}
              onPress={onButtonPress}
            />
          </RowView>
        </ColumnView>
      )}
    </>
  );
};

ForegroundContent.propTypes = {
  buttonTitleColor: PropTypes.instanceOf(Animated.Value),
  deliveryStatus: PropTypes.number,
  foregroundActionTop: PropTypes.instanceOf(Animated.Value),
  foregroundDetailsIconsOpacity: PropTypes.instanceOf(Animated.Value),
  foregroundDetailsTitleOpacity: PropTypes.instanceOf(Animated.Value),
  foregroundDetailsTopOpacity: PropTypes.instanceOf(Animated.Value),
  foregroundTitleColor: PropTypes.instanceOf(Animated.Value),
  foregroundTitleTop: PropTypes.instanceOf(Animated.Value),
  foregroundSize: PropTypes.string,
  onButtonPress: PropTypes.func,
  onChevronUpPress: PropTypes.func,
  onTitleLayoutChange: PropTypes.func,
  optimizedRoutes: PropTypes.bool,
  processing: PropTypes.bool,
  resetHourDay: PropTypes.number,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  stopCount: PropTypes.number
};

export default ForegroundContent;
