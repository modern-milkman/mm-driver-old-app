import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import { NavigationEvents } from 'react-navigation';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import NavigationService from 'Navigation/service';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import { Button, Icon, ListItem, NavBar, Text, Separator } from 'Components';

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
          leftIconAction={navigateBack.bind(null, null)}
          title={I18n.t('screens:checkIn.checkIn')}
        />
        <ColumnView flex={1} justifyContent={'space-between'}>
          <Animated.View
            style={[
              style.fullWidth,
              {
                transform: [{ translateY: contentTranslateY[0] }],
                opacity: contentOpacity[0]
              }
            ]}>
            <Separator />
            <ListItem
              miscelaneousSmall={I18n.t('screens:checkIn.itemsLeft', {
                items: deliveryStatus !== 1 ? itemCount : 0
              })}
              miscelaneousColor={colors.secondary}
              onPress={NavigationService.navigate.bind(null, {
                routeName: 'LoadVan'
              })}
              customIcon={'cart'}
              rightIcon={'chevron-right'}
              title={I18n.t('screens:checkIn.loadVan')}
            />
            <Separator />
          </Animated.View>
          <Animated.View
            style={{
              ...style.fullWidth,
              transform: [{ translateY: contentTranslateY[1] }],
              opacity: contentOpacity[1]
            }}>
            <ColumnView
              width={'auto'}
              marginHorizontal={defaults.marginHorizontal}
              marginVertical={
                deliveryStatus === 1 ? defaults.marginVertical : 0
              }>
              <Button.Primary
                title={I18n.t('general:go')}
                disabled={deliveryStatus !== 1}
                onPress={navigateBack.bind(null, startDelivering.bind(null))}
              />
              {deliveryStatus !== 1 && (
                <RowView marginVertical={defaults.marginVertical / 2}>
                  <Icon
                    size={15}
                    containerSize={15}
                    name={'information-outline'}
                    color={colors.secondary}
                    style={{ marginRight: defaults.marginHorizontal / 3 }}
                  />
                  <Text.Caption
                    align={'center'}
                    color={colors.secondary}
                    noMargin>
                    {I18n.t('screens:checkIn.loadTheVanDescription')}
                  </Text.Caption>
                </RowView>
              )}
            </ColumnView>
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
