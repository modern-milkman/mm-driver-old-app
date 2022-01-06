import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import { Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { colors, defaults, sizes } from 'Theme';
import NavigationService from 'Services/navigation';
import { deliveredStatuses, deviceFrame, mock } from 'Helpers';
import { ColumnView, Modal, RowView, SafeAreaView } from 'Containers';
import {
  Button,
  Image,
  List,
  ListHeader,
  NavBar,
  Picker,
  Separator,
  Text,
  TextInput
} from 'Components';

import { renderImageTextModal } from 'Renders';

import style from './style';

const reasonMessageRef = React.createRef();

const handleChangeSkip = (updateTransientProps, key, value) => {
  updateTransientProps({ [key]: value });
};

const rejectAndNavigateBack = (callback, setModalVisible) => {
  setModalVisible(false);
  NavigationService.goBack({
    beforeCallback: callback
  });
};

const renderFallbackCustomerImage = width => (
  <RowView height={width - defaults.marginHorizontal * 2}>
    <CustomIcon
      width={width - defaults.marginHorizontal * 2}
      icon={'frontDeliveryPlaceholder'}
      disabled
    />
  </RowView>
);

const renderSkipModal = ({
  outOfStockIds,
  reasonMessage,
  rejectReasons,
  selectedStop,
  setModalVisible,
  setRejected,
  reasonType = rejectReasons[2].id,
  updateTransientProps,
  width
}) => (
  <ColumnView
    marginHorizontal={defaults.marginHorizontal}
    width={width - defaults.marginHorizontal * 2}
    flex={1}>
    <ColumnView
      alignItems={'flex-start'}
      backgroundColor={colors.neutral}
      overflow={'hidden'}
      borderRadius={defaults.borderRadius}>
      <ColumnView paddingHorizontal={defaults.marginHorizontal}>
        <Picker
          items={rejectReasons}
          selected={reasonType}
          onChange={handleChangeSkip.bind(
            null,
            updateTransientProps,
            'reasonType'
          )}
        />
        <RowView paddingBottom={defaults.marginVertical}>
          <TextInput
            disableErrors
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
        </RowView>
      </ColumnView>

      <Separator width={'100%'} />

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
            onPress={rejectAndNavigateBack.bind(
              null,
              setRejected.bind(
                null,
                selectedStop.orderId,
                selectedStop.key,
                outOfStockIds,
                reasonType,
                reasonMessage
              ),
              setModalVisible
            )}
            noBorderRadius
          />
        )}
      </RowView>
    </ColumnView>
  </ColumnView>
);

const showClaims = toggleModal => {
  toggleModal('showClaimModal', true);
  NavigationService.navigate({
    routeName: 'CustomerIssueModal'
  });
};

const showModal = (type, setModalType, setModalVisible) => {
  setModalType(type);
  setModalVisible(true);
};

const { width, height } = deviceFrame();

const Deliver = props => {
  const [modalType, setModalType] = useState('skip');
  const [modalVisible, setModalVisible] = useState(false);

  const {
    allItemsDone,
    confirmedItem,
    navigation,
    outOfStockIds,
    routeDescription,
    selectedStop,
    setDelivered,
    toggleConfirmedItem,
    toggleModal,
    toggleOutOfStock
  } = props;

  const acknowledgedList = selectedStop?.claims.acknowledgedList || [];
  const unacknowledgedList = selectedStop?.claims.unacknowledgedList || [];
  const showClaimModal = selectedStop?.claims.showClaimModal;

  const optimizedStopOrders = selectedStop
    ? Object.values(selectedStop.orderItems).map(order => {
        const isOutOfStock = outOfStockIds.includes(order.key);
        return {
          ...order,
          testID: `deliver-deliveryItemRow-${order.productId}`,
          prefix: order.quantity,
          title: order.title,
          customIcon: 'productPlaceholder',
          disabled:
            deliveredStatuses.includes(selectedStop.status) ||
            unacknowledgedList?.length > 0,
          image: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${order.productId}`,
          rightIcon:
            isOutOfStock || order.status === 3
              ? 'alert'
              : confirmedItem.includes(order.key) || order.status === 2
              ? 'check'
              : null,
          enforceLayout: true,
          ...((isOutOfStock || order.status === 3) && {
            rightIconColor: colors.error,
            suffixColor: colors.error
          })
        };
      })
    : null;

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      if (showClaimModal) {
        NavigationService.navigate({
          routeName: 'CustomerIssueModal'
        });
      }
    });

    return focusListener;
  }, [showClaimModal, navigation]);

  if (!selectedStop) {
    return null;
  }

  return (
    <SafeAreaView>
      <Modal visible={modalVisible} transparent={true} animationType={'fade'}>
        {modalType === 'skip' &&
          renderSkipModal({ ...props, width, setModalVisible })}
        {modalType === 'image' &&
          renderImageTextModal({
            imageSource: {
              uri: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_CUSTOMER_IMAGES}/${selectedStop.customerId}-${selectedStop.key}`
            },
            onPress: setModalVisible,
            renderFallback: renderFallbackCustomerImage.bind(null, width),
            text: selectedStop.deliveryInstructions
          })}
      </Modal>

      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}
        alignItems={'stretch'}>
        <NavBar
          leftIcon={'chevron-down'}
          leftIconAction={NavigationService.goBack}
          title={I18n.t('general:details')}
          rightCustomIcon={
            acknowledgedList?.length > 0 ? 'customerIssue' : null
          }
          rightColor={colors.error}
          rightAction={NavigationService.navigate.bind(null, {
            routeName: 'CustomerIssueList'
          })}
          testID={'deliver-navbar'}
        />
        {selectedStop && selectedStop.status !== 'pending' && (
          <>
            <Separator width={'100%'} />
            <RowView
              backgroundColor={
                selectedStop.status === 'completed'
                  ? colors.primary
                  : colors.error
              }>
              <Text.Button testID={'deliver-deliveryStatus'}>
                {I18n.t(`screens:deliver.status.${selectedStop.status}`)}
              </Text.Button>
            </RowView>
          </>
        )}
        <RowView
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}
          marginVertical={defaults.marginVertical / 2}>
          <Text.Heading
            color={colors.secondary}
            numberOfLines={2}
            testID={'deliver-title'}>
            {selectedStop.title}
          </Text.Heading>
          {selectedStop.hasCoolBox && (
            <RowView
              width={sizes.list.image + defaults.marginHorizontal / 2}
              testID={'deliver-coolbox'}>
              <CustomIcon
                width={sizes.list.image}
                containerWidth={sizes.list.image}
                icon={'coolbox'}
                iconColor={colors.secondary}
                disabled
              />
            </RowView>
          )}
        </RowView>

        <Separator
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}
        />

        <RowView
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}
          marginVertical={defaults.marginVertical / 2}
          justifyContent={'space-between'}>
          <Text.Caption color={colors.secondary} testID={'deliver-userId'}>
            {I18n.t('screens:deliver.userId', {
              userId: selectedStop?.userId
            })}
          </Text.Caption>
          <Text.Caption
            color={colors.secondary}
            testID={'deliver-routeDescription'}>
            {I18n.t('screens:deliver.routeDescription', {
              routeDescription
            })}
          </Text.Caption>
        </RowView>

        {selectedStop &&
          (selectedStop.deliveryInstructions ||
            selectedStop.hasImage ||
            selectedStop.hasCoolBox) && (
            <>
              <Separator width={'100%'} />
              <ListHeader
                title={I18n.t('screens:deliver.customer.instructions')}
              />
              <Pressable
                onPress={showModal.bind(
                  null,
                  'image',
                  setModalType,
                  setModalVisible
                )}>
                <RowView
                  width={'auto'}
                  marginHorizontal={defaults.marginHorizontal}
                  marginVertical={defaults.marginVertical / 2}
                  justifyContent={'space-between'}
                  testID={'deliver-frontDeliveryDoor'}>
                  <Image
                    style={style.image}
                    source={{
                      uri: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_CUSTOMER_IMAGES}/${selectedStop.customerId}-${selectedStop.key}`
                    }}
                    resizeMode={'contain'}
                    width={sizes.list.image * 2}
                    renderFallback={() => (
                      <CustomIcon
                        width={sizes.list.image * 2}
                        containerWidth={sizes.list.image * 2}
                        icon={'frontDeliveryPlaceholder'}
                        iconColor={colors.primary}
                        disabled
                      />
                    )}
                  />
                  <RowView
                    flex={1}
                    width={'auto'}
                    marginLeft={defaults.marginHorizontal / 2}>
                    <Text.Input
                      color={colors.secondary}
                      numberOfLines={4}
                      testID={'deliver-deliveryInstructions'}>
                      {selectedStop.deliveryInstructions}
                    </Text.Input>
                  </RowView>
                </RowView>
              </Pressable>
            </>
          )}
        {optimizedStopOrders && (
          <>
            <Separator width={'100%'} />
            <List
              data={
                height > 700
                  ? [
                      {
                        title: I18n.t('screens:deliver.deliveryItems'),
                        data: optimizedStopOrders
                      }
                    ]
                  : optimizedStopOrders
              }
              hasSections={height > 700}
              onLongPress={toggleOutOfStock}
              onPress={toggleConfirmedItem}
            />
          </>
        )}
      </ColumnView>
      {selectedStop && selectedStop.status === 'pending' && (
        <ColumnView
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}
          marginTop={defaults.marginVertical / 2}>
          {unacknowledgedList?.length > 0 && (
            <RowView marginVertical={defaults.marginVertical}>
              <Button.Secondary
                title={I18n.t('screens:deliver.viewClaims', {
                  claimNo: unacknowledgedList?.length
                })}
                onPress={showClaims.bind(null, toggleModal)}
              />
            </RowView>
          )}
          {unacknowledgedList?.length === 0 && (
            <>
              <RowView>
                <Button.Primary
                  title={I18n.t('general:done')}
                  onPress={NavigationService.goBack.bind(null, {
                    afterCallback: setDelivered.bind(
                      null,
                      selectedStop.orderId,
                      selectedStop.key,
                      outOfStockIds
                    )
                  })}
                  disabled={!allItemsDone}
                  testID={'deliver-done'}
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
                  testID={'deliver-skip'}
                />
              </RowView>
            </>
          )}
        </ColumnView>
      )}
    </SafeAreaView>
  );
};

Deliver.propTypes = {
  allItemsDone: PropTypes.bool,
  confirmedItem: PropTypes.array,
  navigation: PropTypes.object,
  outOfStockIds: PropTypes.array,
  reasonMessage: PropTypes.string,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  setDelivered: PropTypes.func,
  setRejected: PropTypes.func,
  toggleConfirmedItem: PropTypes.func,
  toggleModal: PropTypes.func,
  toggleOutOfStock: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Deliver.defaultProps = {
  allItemsDone: false,
  confirmedItem: [],
  outOfStockIds: [],
  reasonMessage: '',
  routeDescription: null,
  selectedStop: {},
  setDelivered: mock,
  setRejected: mock,
  toggleConfirmedItem: mock,
  toggleModal: mock,
  toggleOutOfStock: mock,
  updateTransientProps: mock
};

export default Deliver;
