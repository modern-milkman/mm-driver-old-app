import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Pressable, View } from 'react-native';

import I18n from 'Locales/I18n';

import { colors, defaults, shadows } from 'Theme';
import { ColumnView, RowView } from 'Containers';
import { deliveryStates as DS, ukTimeNow } from 'Helpers';
import { Button, Text, ProgressBar } from 'Components';
import translationStrings from 'Locales/en';

const loaderKeys = Object.keys(
  translationStrings.screens.main.foreground.loaderText
);
const LOADER_MAX_PROGRESS = 100;
const loaderConfig = {
  loaderText: loaderKeys,
  steps: loaderKeys.length + 1,
  stepSize: LOADER_MAX_PROGRESS / (loaderKeys.length + 1)
};
const MIN_FOREGROUND_HEIGHT = 60;

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

const ForegroundContent = props => {
  const {
    buttonAccessibility,
    buttonTitleColor,
    checklist,
    foregroundSize,
    isOptimised,
    loaderInfo,
    onButtonPress,
    processing,
    resetHourDay,
    status,
    stopCount,
    selectedStop
  } = props;

  let foregroundState = 'COME_BACK_LATER';
  const [progress, setProgress] = useState(0);
  let mainActionDisabled = true;

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
            Text.Caption.height +
            buttonAccessibility +
            defaults.marginVertical * (1 + 1 / 2 + 1 / 2)
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
                <RowView>
                  <Text.Heading
                    color={
                      foregroundSize === 'large'
                        ? colors.secondary
                        : colors.white
                    }
                    align={'center'}
                    numberOfLines={1}>
                    {renderHeading(foregroundState, props)}
                  </Text.Heading>
                </RowView>
              </RowView>
              {foregroundSize === 'large' && (
                <RowView
                  width={'auto'}
                  paddingVertical={defaults.marginVertical / 2}>
                  <Text.Caption color={colors.secondaryLight} align={'center'}>
                    {renderSubHeading(foregroundState, props)}
                  </Text.Caption>
                </RowView>
              )}
            </ColumnView>
            {foregroundSize === 'large' && (
              <RowView paddingHorizontal={defaults.marginHorizontal}>
                <Button.Primary
                  titleColor={buttonTitleColor}
                  title={renderButtonTitle(foregroundState, props)}
                  disabled={mainActionDisabled}
                  onPress={onButtonPress}
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
  buttonTitleColor: PropTypes.string,
  checklist: PropTypes.object,
  foregroundSize: PropTypes.string,
  isOptimised: PropTypes.bool,
  loaderInfo: PropTypes.string,
  onButtonPress: PropTypes.func,
  processing: PropTypes.bool,
  resetHourDay: PropTypes.number,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  status: PropTypes.string,
  stopCount: PropTypes.number
};

ForegroundContent.defaults = {
  buttonTitleColor: colors.secondary,
  checklist: PropTypes.object,
  foregroundSize: PropTypes.string,
  isOptimised: PropTypes.bool,
  loaderInfo: PropTypes.string,
  onButtonPress: PropTypes.func,
  processing: PropTypes.bool,
  resetHourDay: PropTypes.number,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  status: PropTypes.string,
  stopCount: PropTypes.number
};

export default ForegroundContent;
