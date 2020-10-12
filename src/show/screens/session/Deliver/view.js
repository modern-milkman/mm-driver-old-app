import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { NavigationEvents } from 'react-navigation';
import { Animated, TouchableOpacity } from 'react-native';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import { deviceFrame, mock } from 'Helpers';
import NavigationService from 'Navigation/service';
import { ColumnView, Modal, RowView, SafeAreaView } from 'Containers';
import {
  Button,
  Image,
  List,
  ListItem,
  NavBar,
  Text,
  TextInput,
  Separator
} from 'Components';

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

const renderSkipModal = ({
  reasonMessage,
  selectedStop,
  setModalVisible,
  setRejected,
  updateTransientProps
}) => (
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
            multiline
            value={reasonMessage}
            placeholder={I18n.t('screens:deliver.modal.inputPlaceholder')}
            onChangeText={handleChangeSkip.bind(null, updateTransientProps)}
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
);

const renderImageModal = ({ selectedStop, setModalVisible }) => (
  <TouchableOpacity
    style={style.fullView}
    onPress={setModalVisible.bind(null, false)}>
    <ColumnView flex={1} justifyContent={'center'} alignItems={'center'}>
      <Image
        requiresAuthentication
        style={style.fullImage}
        resizeMode={'center'}
        source={{
          uri: selectedStop.customerAddressImage
        }}
        width={width}
      />
      <RowView
        height={'auto'}
        alignItems={'flex-start'}
        marginVertical={defaults.marginVertical}>
        <Text.List>{selectedStop.deliveryInstructions}</Text.List>
      </RowView>
    </ColumnView>
  </TouchableOpacity>
);

const showModal = (type, setModalType, setModalVisible) => {
  setModalType(type);
  setModalVisible(true);
};

const Deliver = (props) => {
  const [modalType, setModalType] = useState('skip');
  const [modalVisible, setModalVisible] = useState(false);
  const {
    allItemsDone,
    confirmedItem,
    outOfStock,
    routeDescription,
    selectedStop,
    setDelivered,
    toggleConfirmedItem,
    toggleOutOfStock
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
        {modalType === 'skip' && renderSkipModal({ ...props, setModalVisible })}
        {modalType === 'image' &&
          renderImageModal({ ...props, setModalVisible })}
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
          <Separator />
          <ListItem
            miscelaneousSmall={I18n.t('screens:deliver.routeDescription', {
              routeDescription
            })}
            miscelaneousColor={colors.Primarylight}
            icon={null}
            title={`${selectedStop.forename} ${selectedStop.surname}`}
            description={I18n.t('screens:deliver.customerID', {
              customerId: selectedStop.customerId
            })}
            disabled
          />
        </Animated.View>
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[1] }],
              opacity: contentOpacity[1]
            }
          ]}>
          <>
            <Separator />
            <ListItem
              customIcon={'location'}
              title={selectedStop.title}
              titleExpands
              disabled
            />
          </>
        </Animated.View>
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[2] }],
              opacity: contentOpacity[2]
            }
          ]}>
          {selectedStop &&
            (selectedStop.deliveryInstructions ||
              selectedStop.customerAddressImage) && (
              <>
                <Separator />
                <ListItem
                  onPress={showModal.bind(
                    null,
                    'image',
                    setModalType,
                    setModalVisible
                  )}
                  image={
                    selectedStop.customerAddressImage
                      ? selectedStop.customerAddressImage
                      : null
                  }
                  customIcon={
                    selectedStop.customerAddressImage
                      ? null
                      : 'frontDeliveryPlaceholder'
                  }
                  customIconProps={{ color: colors.primary }}
                  customRightIconProps={{
                    color: selectedStop.customerAddressImage
                      ? colors.primary
                      : colors.input
                  }}
                  customRightIcon={'expand'}
                  title={selectedStop.deliveryInstructions}
                  titleExpands
                  disabled={!selectedStop.customerAddressImage}
                />
              </>
            )}
        </Animated.View>
        <Animated.View
          style={[
            style.flex1,
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[3] }],
              opacity: contentOpacity[3]
            }
          ]}>
          {optimizedStopOrders && (
            <>
              <Separator />
              <List
                data={[
                  {
                    title: I18n.t('screens:deliver.deliveryItems'),
                    data: optimizedStopOrders
                  }
                ]}
                onLongPress={toggleOutOfStock}
                onPress={toggleConfirmedItem}
                hasSections
              />
            </>
          )}
        </Animated.View>
      </ColumnView>
      {selectedStop && selectedStop.status === 'pending' && (
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[4] }],
              opacity: contentOpacity[4]
            }
          ]}>
          <ColumnView
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}
            marginTop={defaults.marginVertical / 2}>
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
              <Button.Outline
                title={I18n.t('general:skip')}
                onPress={showModal.bind(
                  null,
                  'skip',
                  setModalType,
                  setModalVisible
                )}
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
  routeDescription: PropTypes.string,
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
  routeDescription: null,
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
