import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import I18n from 'Locales/I18n';
import Alert from 'Services/alert';
import translationStrings from 'Locales/en';
import { ColumnView, RowView } from 'Containers';
import { colors, defaults, shadows, sizes } from 'Theme';
import { Button, Icon, Text, ProgressBar } from 'Components';
import { deliveryStates as DS, deviceFrame, ukTimeNow } from 'Helpers';

const loaderKeys = Object.keys(
  translationStrings.screens.main.foreground.loaderText
);
const LOADER_MAX_PROGRESS = 100;
const loaderConfig = {
  loaderText: loaderKeys,
  steps: loaderKeys.length + 1,
  stepSize: LOADER_MAX_PROGRESS / (loaderKeys.length + 1)
};
const { width } = deviceFrame();
const MIN_FOREGROUND_HEIGHT = 60;

const buttonTitleText = (foregroundState, { selectedStop }) => {
  switch (foregroundState) {
    case 'MANUAL':
      return I18n.t('screens:main.autoSelectStop');
    case 'CHECKIN':
    case 'NO_DELIVERIES':
    case 'COME_BACK_LATER':
      return I18n.t('screens:checkIn.checkIn');
    case 'START_ROUTE':
      return I18n.t('screens:checkIn.go');
    case 'DELIVERING':
      return I18n.t(
        `screens:main.activeDeliveryFor.${
          selectedStop.itemCount === 1 ? 'singular' : 'plural'
        }`,
        {
          itemCount: selectedStop.itemCount
        }
      );
    case 'VEHICLE_CHECKS_END':
      return I18n.t('screens:checkIn.checkVan');
  }
};

const headingText = (foregroundState, { routeDescription, selectedStop }) => {
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

const subHeadingText = (foregroundState, { stopCount, selectedStop }) => {
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

    default:
      return null;
  }
};

const promptDeliverLater = ({ deliverLater, selectedStopId }) => {
  Alert({
    title: I18n.t('alert:success.main.deliverLater.title'),
    message: I18n.t('alert:success.main.deliverLater.description'),
    buttons: [
      {
        text: I18n.t('general:cancel'),
        style: 'cancel'
      },
      {
        text: I18n.t('general:ok'),
        onPress: deliverLater.bind(null, selectedStopId)
      }
    ]
  });
};

const ForegroundContent = props => {
  const {
    buttonAccessibility,
    checklist,
    deliverLater,
    foregroundSize,
    isOptimised,
    loaderInfo,
    onButtonPress,
    processing,
    resetHourDay,
    status,
    stopCount,
    selectedStop,
    selectedStopId
  } = props;

  let foregroundState = 'COME_BACK_LATER';
  const [progress, setProgress] = useState(0);
  let mainActionDisabled = true;
  const canDeliverLater =
    isOptimised &&
    selectedStop?.status === 'pending' &&
    selectedStop?.sequenceNo > -1;

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
        mainActionDisabled = false;
      } else {
        foregroundState = 'CHECKIN';
        mainActionDisabled = false;
      }
      break;

    case DS.DEL:
      if (selectedStop) {
        foregroundState = 'DELIVERING';
        mainActionDisabled = false;
      } else {
        foregroundState = 'MANUAL';
        if (isOptimised) {
          mainActionDisabled = false;
        }
      }
      break;

    case DS.DELC:
    case DS.SEC:
      if (selectedStop) {
        foregroundState = 'DELIVERING';
        mainActionDisabled = false;
      } else {
        if (checklist.shiftEndVanChecks) {
          foregroundState = 'COME_BACK_LATER';
        } else {
          foregroundState = 'VEHICLE_CHECKS_END';
          mainActionDisabled = false;
        }
      }
      break;

    case DS.SC:
      if (ukTimeNow(true) < resetHourDay) {
        foregroundState = 'COME_BACK_LATER';
      } else {
        foregroundState = 'NO_DELIVERIES';
      }
  }

  const renderedSubHeadingText = subHeadingText(foregroundState, props);

  useEffect(() => {
    if (loaderInfo && processing && progress <= LOADER_MAX_PROGRESS) {
      let steper;
      setTimeout(() => {
        const steperReset =
          (loaderConfig.loaderText.indexOf(loaderInfo) + 1) *
          loaderConfig.stepSize;
        if (progress < steperReset) {
          steper = steperReset - progress;
        } else {
          steper = 0.01;
        }
        setProgress(progress + steper);
      }, 1);
    }
  }, [loaderInfo, progress, processing, foregroundSize]);

  return (
    <View
      style={{ ...shadows.button }}
      height={
        foregroundSize === 'large'
          ? Text.Heading.height +
            (renderedSubHeadingText ? Text.Caption.height : 0) +
            buttonAccessibility +
            defaults.marginVertical *
              (1 + 1 / 2 + (renderedSubHeadingText ? 1 / 2 : 0))
          : MIN_FOREGROUND_HEIGHT
      }
      backgroundColor={
        foregroundSize === 'large' ? colors.white : colors.primary
      }
      width={'100%'}>
      {processing ? (
        <ColumnView height={'100%'} width={'auto'}>
          <ColumnView height={MIN_FOREGROUND_HEIGHT} width={'auto'}>
            <ActivityIndicator
              color={foregroundSize === 'large' ? colors.primary : colors.white}
            />
          </ColumnView>
          {foregroundSize === 'large' && loaderInfo && (
            <>
              <Text.Caption color={colors.secondaryLight} align={'center'}>
                {I18n.t(`screens:main.foreground.loaderText.${loaderInfo}`)}
              </Text.Caption>

              <RowView
                paddingHorizontal={defaults.paddingHorizontal}
                paddingVertical={defaults.paddingHorizontal / 2}>
                <ProgressBar
                  height={8}
                  progress={progress}
                  total={LOADER_MAX_PROGRESS}
                />
              </RowView>
            </>
          )}
        </ColumnView>
      ) : (
        <Pressable
          disabled={foregroundSize === 'large' || mainActionDisabled}
          onPress={onButtonPress}>
          <ColumnView
            height={'100%'}
            {...(foregroundSize === 'large' && {
              paddingBottom: defaults.marginVertical
            })}>
            <ColumnView alignItems={'stretch'}>
              <RowView
                {...(foregroundSize === 'large' && {
                  marginTop: defaults.marginVertical / 2
                })}
                width={'auto'}>
                <RowView
                  width={'auto'}
                  marginHorizontal={defaults.marginHorizontal}
                  justifyContent={'space-between'}>
                  {foregroundSize === 'small' && canDeliverLater && (
                    <Icon
                      color={colors.white}
                      name={'timer-outline'}
                      size={sizes.fab.icon}
                      containerSize={sizes.fab.container}
                      onPress={promptDeliverLater.bind(null, {
                        deliverLater,
                        selectedStopId
                      })}
                    />
                  )}
                  <RowView
                    {...(!renderedSubHeadingText && {
                      marginVertical: defaults.marginVertical / 2
                    })}
                    width={
                      width -
                      (canDeliverLater ? sizes.fab.container : 0) -
                      defaults.marginHorizontal
                    }>
                    <Text.Heading
                      color={
                        foregroundSize === 'large'
                          ? colors.secondary
                          : colors.white
                      }
                      align={'center'}
                      numberOfLines={1}>
                      {headingText(foregroundState, props)}
                    </Text.Heading>
                  </RowView>
                </RowView>
              </RowView>
              {foregroundSize === 'large' && renderedSubHeadingText && (
                <RowView
                  width={'auto'}
                  paddingVertical={defaults.marginVertical / 2}>
                  <Text.Caption color={colors.inputDark} align={'center'}>
                    {subHeadingText(foregroundState, props)}
                  </Text.Caption>
                </RowView>
              )}
            </ColumnView>
            {foregroundSize === 'large' && (
              <RowView
                width={width - defaults.marginHorizontal}
                justifyContent={'space-between'}>
                {canDeliverLater && (
                  <View
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: defaults.borderRadius,
                      width: buttonAccessibility,
                      height: buttonAccessibility
                    }}>
                    <Icon
                      color={colors.white}
                      name={'timer-outline'}
                      size={sizes.fab.icon * (buttonAccessibility / 40)}
                      containerSize={buttonAccessibility}
                      onPress={promptDeliverLater.bind(null, {
                        deliverLater,
                        selectedStopId
                      })}
                    />
                  </View>
                )}
                <Button.Primary
                  title={buttonTitleText(foregroundState, props)}
                  disabled={mainActionDisabled}
                  onPress={onButtonPress}
                  width={
                    width -
                    (canDeliverLater
                      ? buttonAccessibility + defaults.marginHorizontal / 2
                      : 0) -
                    defaults.marginHorizontal
                  }
                  testID={'foregroundContent-main-btn'}
                />
              </RowView>
            )}
          </ColumnView>
        </Pressable>
      )}
    </View>
  );
};

ForegroundContent.propTypes = {
  buttonAccessibility: PropTypes.number,
  checklist: PropTypes.object,
  deliverLater: PropTypes.func,
  foregroundSize: PropTypes.string,
  isOptimised: PropTypes.bool,
  loaderInfo: PropTypes.string,
  onButtonPress: PropTypes.func,
  processing: PropTypes.bool,
  resetHourDay: PropTypes.number,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  selectedStopId: PropTypes.number,
  status: PropTypes.string,
  stopCount: PropTypes.number
};

ForegroundContent.defaults = {};

export default ForegroundContent;
