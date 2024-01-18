import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import I18n from 'Locales/I18n';
import { defaults } from 'Theme';
import NavigationService from 'Services/navigation';
import { ColumnView, RowView, SafeAreaView, useTheme } from 'Containers';
import { Button, Icon, ListItem, NavBar, Text, Separator } from 'Components';
import { deliveryStates as DS, deliverProductsDisabled, mock } from 'Helpers';

import style from './style';

const renderButtonTitle = ({ status }) => {
  switch (status) {
    default:
      return I18n.t('screens:checkIn.go');
    case DS.DELC:
    case DS.SEC:
    case DS.SC:
      return I18n.t('screens:checkIn.endShift');
  }
};

const renderHelperMessage = ({ checklist, colors, status }) => {
  const helperIcon = 'information-outline';
  let helperMessage = I18n.t('screens:checkIn.helperMessages.checkLoadVan');
  switch (status) {
    case DS.NCI:
    case DS.LV:
    case DS.SSC:
      if (checklist.loadedVan && !checklist.shiftStartVanChecks) {
        helperMessage = I18n.t('screens:checkIn.helperMessages.checkVan');
      }
      if (!checklist.loadedVan && checklist.shiftStartVanChecks) {
        helperMessage = I18n.t('screens:checkIn.helperMessages.loadMMVan');
      }
      if (checklist.loadedVan && checklist.shiftStartVanChecks) {
        helperMessage = I18n.t('screens:checkIn.helperMessages.go');
      }
      break;

    case DS.DELC:
      helperMessage = I18n.t('screens:checkIn.helperMessages.checkVanEnd');
      break;
    case DS.SC:
      helperMessage = I18n.t('screens:checkIn.helperMessages.doneForToday');
  }
  return (
    <RowView marginVertical={defaults.marginVertical / 2}>
      <Icon
        size={15}
        containerSize={15}
        name={helperIcon}
        color={colors.inputSecondary}
        style={{ marginRight: defaults.marginHorizontal / 3 }}
      />
      <Text.Caption align={'center'} color={colors.inputSecondary}>
        {helperMessage}
      </Text.Caption>
    </RowView>
  );
};

// TODO empties collected and registration mileage checks
const navigationSideEffect = ({
  updateDeliveryProps,
  resetChecklistPayload,
  checklist
}) => {
  if (!checklist.payloadAltered) {
    updateDeliveryProps({
      status: checklist.shiftStartVanChecks ? DS.SEC : DS.SSC
    });

    resetChecklistPayload({
      resetType: checklist.shiftStartVanChecks ? 'shiftEnd' : 'shiftStart'
    });
  }
};

const CheckIn = props => {
  const { colors } = useTheme();
  const {
    autoSelectStop = true,
    barcodeItemCount = 0,
    checklist = {},
    continueDelivering = mock,
    itemCount = 0,
    resetChecklistPayload = mock,
    isOptimised = false,
    status = DS.NCI,
    startDelivering = mock,
    stopCount = 0,
    TPLItemCount = 0,
    updateDeliveryProps = mock
  } = props;

  const dpDisabled = deliverProductsDisabled({ checklist, status });

  const checkinRows = [
    {
      customIcon: 'vanCheck',
      disabled: checklist.shiftStartVanChecks,
      suffixBottom: null,
      onPress: NavigationService.navigate.bind(null, {
        beforeCallback: navigationSideEffect.bind(null, {
          updateDeliveryProps,
          resetChecklistPayload,
          checklist
        }),
        routeName: 'RegistrationMileage'
      }),
      rightIcon: checklist.shiftStartVanChecks ? 'check' : 'chevron-right',
      title: I18n.t('screens:checkIn.checkIn'),
      testID: 'checkIn-checkVan-listItem'
    },
    ...(itemCount !== 0
      ? [
          {
            customIcon: 'loadVanWithBackground',
            disabled: checklist.deliveryComplete,
            suffixBottom: I18n.t('screens:checkIn.itemsLeft', {
              items: checklist.loadedVanMM ? 0 : itemCount
            }),
            onPress: NavigationService.navigate.bind(null, {
              routeName: 'LoadVan',
              params: { readOnly: checklist.loadedVanMM, type: 'MM' }
            }),
            rightIcon: checklist.loadedVanMM ? 'check' : 'chevron-right',
            title: I18n.t('screens:checkIn.loadMMVan'),
            testID: 'checkIn-loadVan-listItem'
          }
        ]
      : []),
    ...(TPLItemCount !== 0
      ? [
          {
            customIcon: 'loadVanWithBackground',
            disabled: checklist.deliveryComplete,
            suffixBottom: I18n.t('screens:checkIn.itemsLeft', {
              items: checklist.loadedVanTPL ? 0 : TPLItemCount
            }),
            onPress: NavigationService.navigate.bind(null, {
              routeName: 'LoadVan',
              params: { readOnly: checklist.loadedVanTPL, type: 'TPL' }
            }),
            rightIcon: checklist.loadedVanTPL ? 'check' : 'chevron-right',
            title: I18n.t('screens:checkIn.load3PLVan'),
            testID: 'checkIn-load3PLVan-listItem'
          }
        ]
      : []),
    ...(barcodeItemCount !== 0
      ? [
          {
            customIcon: 'barcodeWithBackground',
            disabled: checklist.deliveryComplete,
            suffixBottom: I18n.t('screens:checkIn.itemsLeft', {
              items: checklist.loadedVanBarcode ? 0 : barcodeItemCount
            }),
            onPress: NavigationService.navigate.bind(null, {
              routeName: 'LoadVan',
              params: { readOnly: checklist.loadedVanBarcode, type: 'Barcode' }
            }),
            rightIcon: checklist.loadedVanBarcode ? 'check' : 'chevron-right',
            title: I18n.t('screens:checkIn.scanToVan'),
            testID: 'checkIn-scanToVan-listItem'
          }
        ]
      : []),
    {
      customIcon: 'deliver',
      disabled: dpDisabled,
      suffixBottom: I18n.t('screens:main.descriptions.deliveryActive', {
        stopCount
      }),
      onPress: NavigationService.goBack.bind(null, {
        beforeCallback:
          isOptimised && autoSelectStop ? continueDelivering : startDelivering
      }),
      rightIcon: checklist.deliveryComplete
        ? 'check'
        : dpDisabled
          ? null
          : 'chevron-right',
      title: I18n.t('screens:checkIn.deliverProducts'),
      testID: 'checkIn-deliverProducts-listItem'
    },
    {
      customIcon: 'vanCheck',
      disabled:
        checklist.shiftEndVanChecks ||
        !checklist.deliveryComplete ||
        !checklist.loadedVan ||
        !checklist.shiftStartVanChecks,
      onPress: NavigationService.navigate.bind(null, {
        beforeCallback: navigationSideEffect.bind(null, {
          updateDeliveryProps,
          resetChecklistPayload,
          checklist
        }),
        routeName: 'EmptiesCollected'
      }),
      rightIcon: !checklist.deliveryComplete
        ? null
        : checklist.shiftEndVanChecks
          ? 'check'
          : 'chevron-right',
      title: I18n.t('screens:checkIn.checkOut'),
      testID: 'checkIn-checkVanEnd-listItem'
    }
  ];

  const renderCheckinRow = index => {
    const {
      customIcon,
      disabled,
      suffixBottom,
      onPress,
      rightIcon,
      title,
      testID
    } = checkinRows[index];
    return (
      <View key={index} style={style.fullWidth}>
        <Separator />
        <ListItem
          disabled={disabled}
          enforceLayout
          suffixBottom={suffixBottom}
          suffixColor={colors.inputSecondary}
          onPress={onPress}
          customIcon={customIcon}
          rightIcon={rightIcon}
          title={title}
          testID={testID}
        />
        {index === checkinRows.length - 1 && <Separator />}
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}>
        <NavBar
          leftIcon={'chevron-down'}
          leftIconAction={NavigationService.goBack}
          title={I18n.t('screens:checkIn.title')}
          testID={'checkIn-navbar'}
        />
        <ColumnView flex={1} justifyContent={'space-between'}>
          <ColumnView flex={1} justifyContent={'flex-start'}>
            {checkinRows.map((row, index) => renderCheckinRow(index))}
          </ColumnView>
          <View style={style.fullWidth}>
            <ColumnView
              width={'auto'}
              marginVertical={defaults.marginVertical}
              marginHorizontal={defaults.marginHorizontal}>
              {renderHelperMessage({ checklist, colors, status })}
              <Button.Primary
                title={renderButtonTitle({ status })}
                disabled={
                  ([DS.NCI, DS.LV, DS.SSC].includes(status) &&
                    (checklist.loadedVan === false ||
                      checklist.shiftStartVanChecks === false)) ||
                  ([DS.DELC, DS.SEC].includes(status) &&
                    checklist.shiftEndVanChecks === false)
                }
                onPress={NavigationService.goBack.bind(null, {
                  beforeCallback:
                    status !== DS.SC
                      ? isOptimised && autoSelectStop
                        ? continueDelivering
                        : startDelivering
                      : null
                })}
              />
            </ColumnView>
          </View>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

CheckIn.propTypes = {
  autoSelectStop: PropTypes.bool,
  barcodeItemCount: PropTypes.number,
  checklist: PropTypes.object,
  continueDelivering: PropTypes.func,
  itemCount: PropTypes.number,
  isOptimised: PropTypes.bool,
  status: PropTypes.string,
  resetChecklistPayload: PropTypes.func,
  startDelivering: PropTypes.func,
  stopCount: PropTypes.number,
  TPLItemCount: PropTypes.number,
  updateDeliveryProps: PropTypes.func
};

export default CheckIn;
