import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Animated, Pressable } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { colors, defaults, sizes } from 'Theme';
import { ColumnView, RowView } from 'Containers';
import { deliveryStates as DS, ukTimeNow } from 'Helpers';
import { Button, NavBar, Text, Separator } from 'Components';

import style from './style';

const renderButtonTitle = foregroundState => {
  switch (foregroundState) {
    case 'MANUAL':
      return I18n.t('screens:main.useOptimizedRouting');
    case 'CHECKIN':
    case 'NO_DELIVERIES':
    case 'COME_BACK_LATER':
      return I18n.t('screens:checkIn.checkIn');
    case 'START_ROUTE':
      return I18n.t('screens:checkIn.go');
    case 'DELIVERING':
      return I18n.t('general:details');
    case 'VEHICLE_CHECKS_END':
      return I18n.t('screens:checkIn.checkVan');
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
    case 'VEHICLE_CHECKS_END':
      return I18n.t('screens:checkIn.helperMessages.checkVanEnd');
  }
};

const renderLeftIcon = onChevronUpPress => (
  <CustomIcon
    width={sizes.list.image / 1.5}
    containerWidth={sizes.list.image}
    icon={'expand'}
    iconColor={colors.white}
    onPress={onChevronUpPress}
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
    default:
      return ' ';
  }
};

const onLayout = (onTitleLayoutChange, e) => {
  onTitleLayoutChange(e.nativeEvent.layout.height);
};

const ForegroundContent = props => {
  const {
    buttonTitleColor,
    checklist,
    foregroundActionTop,
    foregroundDetailsIconsOpacity,
    foregroundDetailsTitleOpacity,
    foregroundDetailsTitleWidth,
    foregroundDetailsTopOpacity,
    foregroundTitleColor,
    foregroundTitleTop,
    foregroundSize,
    isOptimised,
    onButtonPress,
    onChevronUpPress,
    optimisedRouting,
    processing,
    resetHourDay,
    status,
    stopCount,
    selectedStop,
    onTitleLayoutChange
  } = props;

  let foregroundState = 'COME_BACK_LATER';

  switch (status) {
    case DS.NCI:
    case DS.LV:
    case DS.SSC:
      if (stopCount === 0) {
        // < handled by default version
        if (ukTimeNow(true) > resetHourDay) {
          foregroundState = 'NO_DELIVERIES';
        }
      } else if (checklist.loadedVan && checklist.shiftStartVanChecks) {
        foregroundState = 'START_ROUTE';
      } else {
        foregroundState = 'CHECKIN';
      }
      break;

    case DS.DEL:
      if (selectedStop) {
        foregroundState = 'DELIVERING';
      } else if (!optimisedRouting) {
        foregroundState = 'MANUAL';
      }
      break;

    case DS.DELC:
    case DS.SEC:
      if (selectedStop) {
        foregroundState = 'DELIVERING';
      } else {
        foregroundState = 'VEHICLE_CHECKS_END';
      }
      break;

    case DS.SC:
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
              <RowView
                animated
                animatedStyle={{ width: foregroundDetailsTitleWidth }}>
                <Text.Heading
                  color={foregroundTitleColor}
                  align={'center'}
                  numberOfLines={1}>
                  {renderHeading(foregroundState, props)}
                </Text.Heading>
              </RowView>
              <Pressable
                onPress={onButtonPress}
                style={style.pressableContainer}
                disabled={
                  ['COME_BACK_LATER', 'NO_DELIVERIES'].includes(
                    foregroundState
                  ) ||
                  (!isOptimised && !selectedStop)
                }>
                <Animated.View
                  style={{
                    opacity: foregroundDetailsIconsOpacity
                  }}>
                  <NavBar
                    LeftComponent={renderLeftIcon.bind(null, onChevronUpPress)}
                    title={''}
                    rightIcon={
                      [3, 4].includes(selectedStop?.satisfactionStatus)
                        ? 'alert-outline'
                        : null
                    }
                    rightColor={colors.white}
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
              disabled={
                ['COME_BACK_LATER', 'NO_DELIVERIES'].includes(
                  foregroundState
                ) ||
                (!isOptimised && !selectedStop)
              }
              onPress={onButtonPress}
              testID={'foregroundContent-main-btn'}
            />
          </RowView>
        </ColumnView>
      )}
    </>
  );
};

ForegroundContent.propTypes = {
  buttonTitleColor: PropTypes.instanceOf(Animated.Value),
  checklist: PropTypes.object,
  foregroundActionTop: PropTypes.instanceOf(Animated.Value),
  foregroundDetailsIconsOpacity: PropTypes.instanceOf(Animated.Value),
  foregroundDetailsTitleOpacity: PropTypes.instanceOf(Animated.Value),
  foregroundDetailsTitleWidth: PropTypes.instanceOf(Animated.Value),
  foregroundDetailsTopOpacity: PropTypes.instanceOf(Animated.Value),
  foregroundTitleColor: PropTypes.instanceOf(Animated.Value),
  foregroundTitleTop: PropTypes.instanceOf(Animated.Value),
  foregroundSize: PropTypes.string,
  isOptimised: PropTypes.bool,
  onButtonPress: PropTypes.func,
  onChevronUpPress: PropTypes.func,
  onTitleLayoutChange: PropTypes.func,
  optimisedRouting: PropTypes.bool,
  processing: PropTypes.bool,
  resetHourDay: PropTypes.number,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  status: PropTypes.string,
  stopCount: PropTypes.number
};

export default ForegroundContent;
