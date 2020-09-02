import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Animated, View } from 'react-native';
import { NavigationEvents } from 'react-navigation';

import I18n from 'Locales/I18n';
import { colors } from 'Theme';
import { mock } from 'Helpers';
import NavigationService from 'Navigation/service';
import { Button, Icon, ListItem, Text, TextInput } from 'Components';
import { ColumnView, Modal, RowView, FullView, SafeAreaView } from 'Containers';

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

const handleChangeSkip = (updateTransientProps, value) => {
  updateTransientProps({ reasonMessage: value });
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
      <Modal visible={modalVisible} transparent={true} animationType={'fade'}>
        <FullView>
          <View style={style.modalBackground} />
          <View style={style.modalWrapper}>
            <ColumnView
              flex={1}
              justifyContent={'flex-start'}
              alignItems={'flex-start'}>
              <Text.Callout color={colors.black}>
                {I18n.t('screens:deliver.modal.title')}
              </Text.Callout>
              <TextInput
                multiline
                value={reasonMessage}
                placeholder={I18n.t('screens:deliver.modal.inputPlaceholder')}
                onChangeText={handleChangeSkip.bind(null, updateTransientProps)}
              />
            </ColumnView>
            <RowView>
              <Button.Plain
                title={I18n.t('general:cancel')}
                onPress={setModalVisible.bind(null, false)}
                width={'40%'}
              />
              {selectedStop && (
                <Button.Primary
                  title={I18n.t('general:skip')}
                  width={'40%'}
                  disabled={reasonMessage === ''}
                  onPress={navigateBack.bind(
                    null,
                    setRejected.bind(null, selectedStop.orderID, reasonMessage)
                  )}
                />
              )}
            </RowView>
          </View>
        </FullView>
      </Modal>

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
            {I18n.t('general:details')}
          </Text.Callout>
          <RowView width={44} height={44} />
        </RowView>
        <Animated.View
          style={{
            transform: [{ translateY: contentTranslateY[0] }],
            opacity: contentOpacity[0]
          }}>
          <ColumnView>
            {selectedStop &&
              selectedStop.orders.map((i) => (
                <ListItem
                  disabled={selectedStop.status === 'completed'}
                  title={i.productName}
                  description={i.measureDescription}
                  rightText={i.quantity}
                  onLongPress={toggleOutOfStock.bind(null, i.orderItemId)}
                  onPress={toggleConfirmedItem.bind(null, i.orderItemId)}
                  rightIcon={
                    outOfStock.includes(i.orderItemId)
                      ? 'alert'
                      : confirmedItem.includes(i.orderItemId)
                      ? 'check'
                      : null
                  }
                  key={i.orderItemId}
                />
              ))}
          </ColumnView>
        </Animated.View>
      </ColumnView>
      {selectedStop && selectedStop.status === 'pending' && (
        <Animated.View
          style={{
            transform: [{ translateY: contentTranslateY[1] }],
            opacity: contentOpacity[1]
          }}>
          <ColumnView>
            <Button.Primary
              title={I18n.t('general:done')}
              onPress={navigateBack.bind(
                null,
                setDelivered.bind(null, selectedStop.orderID)
              )}
              disabled={!allItemsDone}
              width={'70%'}
            />

            <Button.Destroy
              title={I18n.t('general:skip')}
              onPress={setModalVisible.bind(null, true)}
              width={'70%'}
            />
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
