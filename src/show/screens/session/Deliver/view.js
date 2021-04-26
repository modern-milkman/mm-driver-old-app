import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { NavigationEvents } from 'react-navigation';
import { Animated, TouchableOpacity } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
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
  Picker,
  Separator,
  Text,
  TextInput
} from 'Components';

import style from './style';

const reasonMessageRef = React.createRef();

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress
  }
});

const { width, height } = deviceFrame();

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
        duration: 75,
        delay: delayIndex * 100
      }),
      Animated.timing(contentOpacity[index], {
        toValue: contentOpacityValue,
        useNativeDriver: false,
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

const handleChangeSkip = (updateTransientProps, key, value) => {
  updateTransientProps({ [key]: value });
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
  rejectReasons,
  selectedStop,
  setModalVisible,
  setRejected,
  reasonId = rejectReasons[0].id,
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

        <ColumnView>
          <Picker
            items={rejectReasons}
            selected={reasonId}
            onChange={handleChangeSkip.bind(
              null,
              updateTransientProps,
              'reasonId'
            )}
          />
          <TextInput
            multiline
            value={reasonMessage}
            placeholder={I18n.t('screens:deliver.modal.inputPlaceholder')}
            onChangeText={handleChangeSkip.bind(
              null,
              updateTransientProps,
              'reasonMessage'
            )}
            ref={reasonMessageRef}
          />
        </ColumnView>
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
              setRejected.bind(
                null,
                selectedStop.orderID,
                reasonId,
                reasonMessage,
                selectedStop.key
              )
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
    {selectedStop && (
      <ColumnView flex={1} justifyContent={'center'} alignItems={'center'}>
        {selectedStop.customerAddressImage ? (
          <Image
            requiresAuthentication
            source={{
              uri: `data:image/png;base64,${selectedStop.customerAddressImage}`
            }}
            style={style.image}
            width={width - defaults.marginHorizontal * 2}
            maxHeight={height * 0.7}
          />
        ) : (
          <RowView height={width - defaults.marginHorizontal * 2}>
            <CustomIcon
              width={width - defaults.marginHorizontal * 2}
              icon={'frontDeliveryPlaceholder'}
              disabled
            />
          </RowView>
        )}
        {selectedStop.deliveryInstructions && (
          <RowView
            height={'auto'}
            alignItems={'flex-start'}
            marginVertical={defaults.marginVertical}
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}>
            <Text.List>{selectedStop.deliveryInstructions}</Text.List>
          </RowView>
        )}
      </ColumnView>
    )}
  </TouchableOpacity>
);

const showClaims = (toggleModal) => {
  toggleModal('showClaimModal', true);
  NavigationService.navigate({
    routeName: 'CustomerIssueModal'
  });
};

const showModal = (type, setModalType, setModalVisible) => {
  setModalType(type);
  setModalVisible(true);
};

const Deliver = (props) => {
  const [modalType, setModalType] = useState('skip');

  const [modalVisible, setModalVisible] = useState(false);
  const {
    allItemsDone,
    claims: { driverUnacknowledgedNr, list, showedUnacknowledgedNr },
    confirmedItem,
    outOfStock,
    processing,
    routeDescription,
    selectedStop,
    setDelivered,
    showClaimModal,
    toggleConfirmedItem,
    toggleModal,
    toggleOutOfStock
  } = props;

  const optimizedStopOrders = selectedStop
    ? Object.values(selectedStop.orders).map((order) => {
        const isOutOfStock = outOfStock.includes(order.key);
        return {
          ...order,
          disabled:
            selectedStop.status === 'completed' || driverUnacknowledgedNr > 0,
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
          contentOpacityValue: 1,
          callback: showClaimModal
            ? NavigationService.navigate.bind(null, {
                routeName: 'CustomerIssueModal'
              })
            : null
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
          rightCustomIcon={
            list?.length > 0 && driverUnacknowledgedNr === 0
              ? 'customerIssue'
              : null
          }
          rightColor={colors.error}
          rightAction={NavigationService.navigate.bind(null, {
            routeName: 'CustomerIssueList'
          })}
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
            miscelaneousBottom={I18n.t('screens:deliver.routeDescription', {
              routeDescription
            })}
            miscelaneousColor={colors.Primarylight}
            icon={null}
            description={I18n.t('screens:deliver.customerID', {
              customerId: selectedStop?.customerId
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
              title={selectedStop?.title}
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
                      ? `data:image/png;base64,${selectedStop.customerAddressImage}`
                      : null
                  }
                  customIcon={
                    selectedStop.customerAddressImage
                      ? null
                      : 'frontDeliveryPlaceholder'
                  }
                  customIconProps={{ color: colors.primary }}
                  customRightIconProps={{
                    color: colors.primary
                  }}
                  customRightIcon={'expand'}
                  title={selectedStop.deliveryInstructions}
                  titleExpands
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
            {driverUnacknowledgedNr > 0 && (
              <RowView marginVertical={defaults.marginVertical}>
                <Button.Secondary
                  title={I18n.t('screens:deliver.viewClaims', {
                    claimNo: driverUnacknowledgedNr - showedUnacknowledgedNr + 1
                  })}
                  onPress={showClaims.bind(null, toggleModal)}
                />
              </RowView>
            )}
            {!driverUnacknowledgedNr && (
              <>
                <RowView>
                  <Button.Primary
                    title={I18n.t('general:done')}
                    onPress={navigateBack.bind(
                      null,
                      setDelivered.bind(
                        null,
                        selectedStop.orderID,
                        selectedStop.key
                      )
                    )}
                    disabled={
                      !allItemsDone || processing || driverUnacknowledgedNr
                    }
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
                    disabled={processing || driverUnacknowledgedNr}
                  />
                </RowView>
              </>
            )}
          </ColumnView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

Deliver.propTypes = {
  allItemsDone: PropTypes.bool,
  claims: PropTypes.object,
  confirmedItem: PropTypes.array,
  outOfStock: PropTypes.array,
  processing: PropTypes.bool,
  reasonMessage: PropTypes.string,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  setDelivered: PropTypes.func,
  setRejected: PropTypes.func,
  showClaimModal: PropTypes.bool,
  toggleConfirmedItem: PropTypes.func,
  toggleModal: PropTypes.func,
  toggleOutOfStock: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Deliver.defaultProps = {
  allItemsDone: false,
  claims: {},
  confirmedItem: [],
  outOfStock: [],
  processing: false,
  reasonMessage: '',
  routeDescription: null,
  selectedStop: {},
  setDelivered: mock,
  showClaimModal: false,
  setRejected: mock,
  toggleConfirmedItem: mock,
  toggleModal: mock,
  toggleOutOfStock: mock,
  updateTransientProps: mock
};

Deliver.navigationOptions = {
  cardStyleInterpolator: forFade
};

export default Deliver;
