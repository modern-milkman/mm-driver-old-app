import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Animated } from 'react-native';
import { NavigationEvents } from 'react-navigation';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import { deviceFrame, mock } from 'Helpers';
import NavigationService from 'Navigation/service';
import { ColumnView, Modal, RowView, SafeAreaView } from 'Containers';
import { Button, List, NavBar, Text, TextInput, Separator } from 'Components';

import style from './style';

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress
  }
});

const { width } = deviceFrame();

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

const handleChangeSkip = (updateTransientProps, value) => {
  updateTransientProps({ reasonMessage: value });
};

const navigateBack = (callback) => {
  animateContent({
    contentTranslateYValue: 100,
    contentOpacityValue: 0,
    callback,
    reverse: true
  });

  NavigationService.goBack();
};

const Deliver = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    allItemsDone,
    confirmedItem,
    selectedStop,
    outOfStock,
    reasonMessage,
    setDelivered,
    setRejected,
    toggleConfirmedItem,
    toggleOutOfStock,
    updateTransientProps
  } = props;

  const optimizedStopOrders = selectedStop
    ? selectedStop.orders.map((order) => {
        const isOutOfStock = outOfStock.includes(order.key);
        return {
          ...order,
          disabled: selectedStop.status === 'completed',
          rightIcon: isOutOfStock
            ? 'alert'
            : confirmedItem.includes(order.key)
            ? 'check'
            : null,
          ...(isOutOfStock && {
            rightIconColor: colors.error,
            miscelaneousColor: colors.error
          })
        };
      })
    : null;

  return (
    <SafeAreaView top bottom>
      <NavigationEvents
        onDidFocus={animateContent.bind(null, {
          contentTranslateYValue: 0,
          contentOpacityValue: 1
        })}
      />
      <Modal visible={modalVisible} transparent={true} animationType={'fade'}>
        <ColumnView
          marginHorizontal={defaults.marginHorizontal}
          width={width - defaults.marginHorizontal * 2}
          flex={1}>
          <ColumnView
            alignItems={'flex-start'}
            backgroundColor={colors.neutral}
            borderRadius={defaults.borderRadius}
            overflow={'hidden'}>
            <ColumnView
              alignItems={'flex-start'}
              paddingTop={defaults.marginVertical}
              paddingHorizontal={defaults.marginHorizontal}>
              <Text.Heading color={colors.secondary}>
                {I18n.t('screens:deliver.modal.title')}
              </Text.Heading>

              <RowView paddingTop={defaults.marginVertical}>
                <TextInput
                  style={style.maxInputHeight}
                  multiline
                  value={reasonMessage}
                  placeholder={I18n.t('screens:deliver.modal.inputPlaceholder')}
                  onChangeText={handleChangeSkip.bind(
                    null,
                    updateTransientProps
                  )}
                />
              </RowView>
            </ColumnView>

            <Separator color={colors.input} width={'100%'} />

            <RowView>
              <Button.Tertiary
                title={I18n.t('general:cancel')}
                onPress={setModalVisible.bind(null, false)}
                width={'50%'}
                noBorderRadius
              />
              {selectedStop && (
                <Button.Primary
                  title={I18n.t('general:skip')}
                  width={'50%'}
                  disabled={reasonMessage === ''}
                  onPress={navigateBack.bind(
                    null,
                    setRejected.bind(null, selectedStop.orderID, reasonMessage)
                  )}
                  noBorderRadius
                />
              )}
            </RowView>
          </ColumnView>
        </ColumnView>
      </Modal>

      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}>
        <NavBar
          leftIcon={'chevron-down'}
          leftIconAction={navigateBack.bind(null, null)}
          title={I18n.t('general:details')}
        />
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[0] }],
              opacity: contentOpacity[0]
            }
          ]}>
          {optimizedStopOrders && (
            <List
              data={optimizedStopOrders}
              onLongPress={toggleOutOfStock}
              onPress={toggleConfirmedItem}
            />
          )}
        </Animated.View>
      </ColumnView>
      {selectedStop && selectedStop.status === 'pending' && (
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[1] }],
              opacity: contentOpacity[1]
            }
          ]}>
          <ColumnView
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}>
            <RowView>
              <Button.Primary
                title={I18n.t('general:done')}
                onPress={navigateBack.bind(
                  null,
                  setDelivered.bind(null, selectedStop.orderID)
                )}
                disabled={!allItemsDone}
              />
            </RowView>
            <RowView marginVertical={defaults.marginVertical}>
              <Button.Error
                title={I18n.t('general:skip')}
                onPress={setModalVisible.bind(null, true)}
              />
            </RowView>
          </ColumnView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

Deliver.propTypes = {
  allItemsDone: PropTypes.bool,
  confirmedItem: PropTypes.array,
  selectedStop: PropTypes.object,
  outOfStock: PropTypes.array,
  reasonMessage: PropTypes.string,
  setDelivered: PropTypes.func,
  setRejected: PropTypes.func,
  toggleConfirmedItem: PropTypes.func,
  toggleOutOfStock: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Deliver.defaultProps = {
  allItemsDone: false,
  confirmedItem: [],
  selectedStop: {},
  outOfStock: [],
  reasonMessage: '',
  setDelivered: mock,
  setRejected: mock,
  toggleConfirmedItem: mock,
  toggleOutOfStock: mock,
  updateTransientProps: mock
};

Deliver.navigationOptions = {
  cardStyleInterpolator: forFade
};

export default Deliver;
