import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Animated } from 'react-native';

import I18n from 'Locales/I18n';
import { ukTimeNow } from 'Helpers';
import { defaults, colors } from 'Theme';
import { ColumnView, RowView } from 'Containers';
import { Button, Text, Separator } from 'Components';

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
    deliveryStatus,
    interpolatedValues,
    onButtonPress,
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
        <ColumnView flex={1}>
          <ActivityIndicator color={colors.primary} />
        </ColumnView>
      ) : (
        <ColumnView marginTop={defaults.paddingHorizontal}>
          <Animated.View
            style={{ opacity: interpolatedValues.foregroundDetailsOpacity }}>
            <ColumnView alignItems={'stretch'}>
              <RowView width={'auto'}>
                <Separator
                  height={5}
                  width={38}
                  color={colors.inputDark}
                  borderRadius={10}
                />
              </RowView>

              <RowView
                marginTop={defaults.marginVertical / 3}
                width={'auto'}
                onLayout={onLayout.bind(this, onTitleLayoutChange)}>
                <Text.Heading color={colors.secondary} align={'center'}>
                  {renderHeading(foregroundState, props)}
                </Text.Heading>
              </RowView>

              <RowView
                marginVertical={defaults.marginVertical / 3}
                width={'auto'}>
                <Text.Caption color={colors.secondaryLight} align={'center'}>
                  {renderSubHeading(foregroundState, props)}
                </Text.Caption>
              </RowView>
            </ColumnView>
          </Animated.View>

          <Animated.View
            style={{
              transform: [
                { translateY: interpolatedValues.foregroundActionTop }
              ]
            }}>
            <RowView paddingHorizontal={defaults.marginHorizontal}>
              <Button.Primary
                backgroundOpacity={interpolatedValues.foregroundDetailsOpacity}
                titleColor={interpolatedValues.buttonTitleColor}
                title={renderButtonTitle(foregroundState, props)}
                disabled={['COME_BACK_LATER', 'NO_DELIVERIES'].includes(
                  foregroundState
                )}
                onPress={onButtonPress}
              />
            </RowView>
          </Animated.View>
        </ColumnView>
      )}
    </>
  );
};

ForegroundContent.propTypes = {
  deliveryStatus: PropTypes.number,
  interpolatedValues: PropTypes.object,
  onButtonPress: PropTypes.func,
  onTitleLayoutChange: PropTypes.func,
  optimizedRoutes: PropTypes.bool,
  processing: PropTypes.bool,
  resetHourDay: PropTypes.number,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  stopCount: PropTypes.number
};

export default ForegroundContent;
