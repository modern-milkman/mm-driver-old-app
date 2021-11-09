import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import { NavigationEvents } from 'react-navigation';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import NavigationService from 'Navigation/service';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import { Button, Icon, ListItem, NavBar, Text, Separator } from 'Components';
import { mock, deliveryStates as DS, deliverProductsDisabled } from 'Helpers';

import style from './style';

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress
  }
});

const navigateBack = callback => {
  animateContent({
    contentTranslateYValue: 100,
    contentOpacityValue: 0,
    callback,
    reverse: true
  });
};

const animateContent = ({
  contentTranslateYValue,
  contentOpacityValue,
  callback = mock,
  reverse = false
}) => {
  let index = 0;
  let delayIndex = 0;
  if (reverse) {
    index = contentTranslateY.length - 1;
  }
  const runAnimations = [];
  for (
    index;
    (index < contentTranslateY.length && !reverse) || (index >= 0 && reverse);
    reverse ? (index--, delayIndex++) : (index++, delayIndex++)
  ) {
    runAnimations.push(
      Animated.timing(contentTranslateY[index], {
        toValue: contentTranslateYValue,
        useNativeDriver: true,
        duration: 75,
        delay: delayIndex * 100
      }),
      Animated.timing(contentOpacity[index], {
        toValue: contentOpacityValue,
        useNativeDriver: true,
        duration: 75,
        delay: delayIndex * 100
      })
    );
  }
  Animated.parallel(runAnimations).start(callback);
};

const contentTranslateY = [
  new Animated.Value(100),
  new Animated.Value(100),
  new Animated.Value(100),
  new Animated.Value(100),
  new Animated.Value(100)
];
const contentOpacity = [
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0)
];

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
    checklist,
    continueDelivering,
    itemCount,
    optimisedRouting,
    status,
    startDelivering,
    stopCount
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
        beforeCallback: navigateBack.bind(
          null,
          optimisedRouting ? continueDelivering : startDelivering
        )
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
      <Animated.View
        style={[
          style.fullWidth,
          {
            transform: [{ translateY: contentTranslateY[index] }],
            opacity: contentOpacity[index]
          }
        ]}>
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
      </Animated.View>
    );
  };

  return (
    <SafeAreaView top bottom>
      <NavigationEvents
        onDidFocus={animateContent.bind(null, {
          contentTranslateYValue: 0,
          contentOpacityValue: 1
        })}
      />
      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}>
        <NavBar
          leftIcon={'chevron-down'}
          leftIconAction={NavigationService.goBack.bind(null, {
            beforeCallback: navigateBack.bind(null, null)
          })}
          title={renderTitle({ checklist, status })}
          testID={'checkIn-navbar'}
        />
        <ColumnView flex={1} justifyContent={'space-between'}>
          <ColumnView flex={1} justifyContent={'flex-start'}>
            {checkinRows.map((row, index) => renderCheckinRow(index))}
          </ColumnView>
          <Animated.View
            style={{
              ...style.fullWidth,
              transform: [{ translateY: contentTranslateY[4] }],
              opacity: contentOpacity[4]
            }}>
            <ColumnView
              width={'auto'}
              marginHorizontal={defaults.marginHorizontal}
              marginVertical={defaults.marginVertical}>
              <Button.Primary
                title={renderButtonTitle({ checklist, status })}
                disabled={
                  ([DS.NCI, DS.LV, DS.SSC].includes(status) &&
                    (checklist.loadedVan === false ||
                      checklist.shiftStartVanChecks === false)) ||
                  ![DS.NCI, DS.LV, DS.SSC, DS.SC].includes(status)
                }
                onPress={NavigationService.goBack.bind(null, {
                  beforeCallback: navigateBack.bind(
                    null,
                    status !== DS.SC
                      ? optimisedRouting
                        ? continueDelivering
                        : startDelivering
                      : null
                  )
                })}
              />
              {renderHelperMessage({ checklist, status })}
            </ColumnView>
          </Animated.View>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

CheckIn.propTypes = {
  checklist: PropTypes.object,
  itemCount: PropTypes.number,
  continueDelivering: PropTypes.func,
  optimisedRouting: PropTypes.bool,
  status: PropTypes.string,
  startDelivering: PropTypes.func,
  stopCount: PropTypes.number
};

CheckIn.defaultProps = {
  itemCount: 0,
  optimisedRouting: false,
  status: DS.NCI,
  stopCount: 0
};

CheckIn.navigationOptions = {
  cardStyleInterpolator: forFade
};

export default CheckIn;
