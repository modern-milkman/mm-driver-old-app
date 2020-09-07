import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import { NavigationEvents } from 'react-navigation';

import I18n from 'Locales/I18n';
import { colors } from 'Theme';
import { mock } from 'Helpers';
import NavigationService from 'Navigation/service';
import { Button, Icon, ListItem, Text } from 'Components';
import { ColumnView, RowView, SafeAreaView } from 'Containers';

import style from './style';

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress
  }
});

const navigateBack = (callback) => {
  animateContent({
    contentTranslateYValue: 100,
    contentOpacityValue: 0,
    callback,
    reverse: true
  });

  NavigationService.goBack();
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
        useNativeDriver: false,
        duration: 125,
        delay: delayIndex * 150
      }),
      Animated.timing(contentOpacity[index], {
        toValue: contentOpacityValue,
        useNativeDriver: false,
        duration: 125,
        delay: delayIndex * 150
      })
    );
  }
  Animated.parallel(runAnimations).start(callback);
};

const contentTranslateY = [new Animated.Value(100), new Animated.Value(100)];
const contentOpacity = [new Animated.Value(0), new Animated.Value(0)];

const CheckIn = (props) => {
  const { deliveryStatus, itemCount, startDelivering } = props;
  return (
    <SafeAreaView
      top
      bottom
      style={[style.container, { backgroundColor: colors.standard }]}>
      <NavigationEvents
        onDidFocus={animateContent.bind(null, {
          contentTranslateYValue: 0,
          contentOpacityValue: 1
        })}
      />
      <ColumnView
        backgroundColor={colors.standard}
        flex={1}
        justifyContent={'flex-start'}>
        <RowView
          justifyContent={'space-between'}
          height={44}
          alignItems={'center'}>
          <Icon
            name={'chevron-down'}
            color={colors.primary}
            size={32}
            containerSize={44}
            onPress={navigateBack.bind(null, null)}
          />
          <Text.Callout color={colors.black}>
            {I18n.t('screens:checkIn.checkIn')}
          </Text.Callout>
          <RowView width={44} height={44} />
        </RowView>
        <ColumnView flex={1} justifyContent={'space-between'}>
          <Animated.View
            style={{
              transform: [{ translateY: contentTranslateY[0] }],
              opacity: contentOpacity[0]
            }}>
            <ListItem
              leftIcon={'package-variant'}
              rightIcon={'chevron-right'}
              title={I18n.t('screens:checkIn.loadVan')}
              rightText={I18n.t('screens:checkIn.itemsLeft', {
                items: deliveryStatus !== 1 ? itemCount : 0
              })}
              onPress={NavigationService.navigate.bind(null, {
                routeName: 'LoadVan'
              })}
            />
          </Animated.View>
          <Animated.View
            style={{
              transform: [{ translateY: contentTranslateY[1] }],
              opacity: contentOpacity[1]
            }}>
            <Button.Primary
              title={I18n.t('general:go')}
              disabled={deliveryStatus !== 1}
              onPress={navigateBack.bind(null, startDelivering.bind(null))}
            />
            {deliveryStatus !== 1 && (
              <RowView width={null}>
                <Icon
                  size={15}
                  containerSize={15}
                  name={'information-outline'}
                  color={colors.black}
                />
                <Text.Caption align={'center'} color={colors.black} noMargin>
                  {I18n.t('screens:checkIn.loadTheVanDescription')}
                </Text.Caption>
              </RowView>
            )}
          </Animated.View>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

CheckIn.propTypes = {
  deliveryStatus: PropTypes.number,
  itemCount: PropTypes.number,
  startDelivering: PropTypes.func
};

CheckIn.defaultProps = {
  itemCount: 0,
  deliveryStatus: 0
};

CheckIn.navigationOptions = {
  cardStyleInterpolator: forFade
};

export default CheckIn;
