import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Config from 'react-native-config';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import NavigationService from 'Services/navigation';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import { deliveryStates as DS, deliverProductsDisabled } from 'Helpers';
import { Button, Icon, ListItem, NavBar, Text, Separator } from 'Components';

import style from './style';

const openRateMyRound = ({ updateChecklistProps, updateInAppBrowserProps }) => {
  updateChecklistProps({ rateMyRound: true });
  updateInAppBrowserProps({
    visible: true,
    url: Config.RATE_MY_ROUND
  });
};

const renderButtonTitle = ({ checklist, status }) => {
  switch (status) {
    default:
      return I18n.t('screens:checkIn.go');
    case DS.DELC:
    case DS.SEC:
    case DS.SC:
      return I18n.t('screens:checkIn.endShift');
  }
};

const renderHelperMessage = ({ checklist, status }) => {
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
        helperMessage = I18n.t('screens:checkIn.helperMessages.loadVan');
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
        color={colors.secondary}
        style={{ marginRight: defaults.marginHorizontal / 3 }}
      />
      <Text.Caption align={'center'} color={colors.secondary}>
        {helperMessage}
      </Text.Caption>
    </RowView>
  );
};

const renderTitle = ({ checklist, status }) => {
  switch (status) {
    case DS.LV:
    case DS.SSC:
      if (checklist.loadedVan && checklist.shiftStartVanChecks) {
        return I18n.t('screens:checkIn.go');
      }
      return I18n.t('screens:checkIn.checkIn');
    case DS.DELC:
    case DS.SEC:
      return I18n.t('screens:checkIn.checkVan');
    case DS.SC:
      return I18n.t('screens:checkIn.endShift');
    default:
      return I18n.t('screens:checkIn.checkIn');
  }
};

const CheckIn = props => {
  const {
    autoSelectStop,
    checklist,
    continueDelivering,
    itemCount,
    isOptimised,
    status,
    startDelivering,
    stopCount,
    updateChecklistProps,
    updateInAppBrowserProps
  } = props;

  const dpDisabled = deliverProductsDisabled({ checklist, status });

  const checkinRows = [
    {
      customIcon: 'vanCheck',
      disabled: checklist.shiftStartVanChecks,
      suffixBottom: null,
      onPress: NavigationService.navigate.bind(null, {
        routeName: 'RegistrationMileage'
      }),
      rightIcon: checklist.shiftStartVanChecks ? 'check' : 'chevron-right',
      title: I18n.t('screens:checkIn.checkVan'),
      testID: 'checkIn-checkVan-listItem'
    },
    {
      customIcon: 'cart',
      disabled: checklist.deliveryComplete,
      suffixBottom: I18n.t('screens:checkIn.itemsLeft', {
        items: checklist.loadedVan ? 0 : itemCount
      }),
      onPress: NavigationService.navigate.bind(null, {
        routeName: 'LoadVan',
        params: { readOnly: checklist.loadedVan }
      }),
      rightIcon: checklist.loadedVan ? 'check' : 'chevron-right',
      title: I18n.t('screens:checkIn.loadVan'),
      testID: 'checkIn-loadVan-listItem'
    },
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
      customIcon: 'star',
      disabled:
        checklist.rateMyRound ||
        !checklist.deliveryComplete ||
        !checklist.loadedVan ||
        !checklist.shiftStartVanChecks,
      onPress: openRateMyRound.bind(null, {
        updateChecklistProps,
        updateInAppBrowserProps
      }),
      rightIcon: !checklist.deliveryComplete
        ? null
        : checklist.rateMyRound
        ? 'check'
        : 'chevron-right',
      title: I18n.t('screens:checkIn.rateMyRound'),
      testID: 'checkIn-checkVanEnd-listItem'
    },
    {
      customIcon: 'vanCheck',
      disabled:
        checklist.shiftEndVanChecks ||
        !checklist.deliveryComplete ||
        !checklist.loadedVan ||
        !checklist.shiftStartVanChecks,
      onPress: NavigationService.navigate.bind(null, {
        routeName: 'RegistrationMileage'
      }),
      rightIcon: !checklist.deliveryComplete
        ? null
        : checklist.shiftEndVanChecks
        ? 'check'
        : 'chevron-right',
      title: I18n.t('screens:checkIn.checkVan'),
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
      <View style={style.fullWidth}>
        <Separator />
        <ListItem
          disabled={disabled}
          enforceLayout
          suffixBottom={suffixBottom}
          suffixColor={colors.secondary}
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
          title={renderTitle({ checklist, status })}
          testID={'checkIn-navbar'}
        />
        <ColumnView flex={1} justifyContent={'space-between'}>
          <ColumnView flex={1} justifyContent={'flex-start'}>
            {checkinRows.map((row, index) => renderCheckinRow(index))}
          </ColumnView>
          <View style={style.fullWidth}>
            <ColumnView
              width={'auto'}
              marginHorizontal={defaults.marginHorizontal}>
              <Button.Primary
                title={renderButtonTitle({ checklist, status })}
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
              {renderHelperMessage({ checklist, status })}
            </ColumnView>
          </View>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

CheckIn.propTypes = {
  autoSelectStop: PropTypes.bool,
  checklist: PropTypes.object,
  continueDelivering: PropTypes.func,
  itemCount: PropTypes.number,
  isOptimised: PropTypes.bool,
  status: PropTypes.string,
  startDelivering: PropTypes.func,
  stopCount: PropTypes.number,
  updateChecklistProps: PropTypes.func,
  updateInAppBrowserProps: PropTypes.func,
  updateProps: PropTypes.func
};

CheckIn.defaultProps = {
  autoSelectStop: true,
  itemCount: 0,
  isOptimised: false,
  status: DS.NCI,
  stopCount: 0
};

export default CheckIn;
