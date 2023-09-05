import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import { Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { defaults, sizes } from 'Theme';
import { ImageTextModal } from 'Renders';
import actionSheet from 'Services/actionSheet';
import NavigationService from 'Services/navigation';
import { ColumnView, Modal, RowView, SafeAreaView, useTheme } from 'Containers';
import {
  deliveredStatuses,
  deviceFrame,
  distance,
  mock,
  preopenPicker
} from 'Helpers';
import {
  Button,
  Image,
  List,
  ListHeader,
  NavBar,
  SegmentedControl,
  Separator,
  Text,
  TextInput
} from 'Components';

import style from './style';

const reasonMessageRef = React.createRef();

const focusReasonMessage = () => {
  reasonMessageRef?.current?.focus();
};

const handleChangeSkip = (updateTransientProps, key, value) => {
  updateTransientProps({ [key]: value });
  focusReasonMessage();
};

const openActionSheet = ({ rejectReasons, updateTransientProps }) => {
  const options = [];
  for (const reason of rejectReasons) {
    options[reason.description] = handleChangeSkip.bind(
      null,
      updateTransientProps,
      'reasonType',
      reason
    );
  }
  actionSheet(options);
};

const podPrompt = ({
  podImage,
  proofOfDeliveryRequired,
  setModalImageSrc,
  setModalText,
  setModalType,
  setModalVisible,
  updateProps
}) => {
  preopenPicker({
    key: 'pod',
    addImage: (key, path, mime) => {
      updateProps({
        podImage: {
          key,
          path,
          mime
        }
      });
    },
    ...(podImage && {
      reviewPhoto: showModal.bind(null, {
        imageSrc: podImage.path,
        text: null,
        type: 'image',
        setModalImageSrc,
        setModalText,
        setModalType,
        setModalVisible
      }),
      deletePhoto: updateProps.bind(null, {
        podImage: null
      })
    }),
    title: proofOfDeliveryRequired
      ? I18n.t('screens:deliver.proofOfDeliveryRequired')
      : null
  });
};

const rejectAndNavigateBack = (
  callback,
  setModalImageSrc,
  setModalText,
  setModalVisible
) => {
  setModalVisible(false);
  setModalImageSrc(null);
  setModalText(null);
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
  colors,
  hasCollectedEmpties,
  outOfStockIds,
  reasonMessage,
  rejectReasons,
  selectedStop,
  setModalImageSrc,
  setModalText,
  setModalVisible,
  setRejected,
  reasonType,
  updateTransientProps,
  width
}) => (
  <ColumnView
    marginHorizontal={defaults.marginHorizontal}
    width={width - defaults.marginHorizontal * 2}
    flex={1}>
    <ColumnView
      alignItems={'flex-start'}
      borderColor={colors.input}
      borderWidth={1}
      backgroundColor={colors.neutral}
      overflow={'hidden'}
      borderRadius={defaults.borderRadius}>
      <ColumnView paddingHorizontal={defaults.marginHorizontal}>
        <RowView
          justifyContent={'flex-start'}
          marginTop={defaults.marginVertical}
          marginBottom={defaults.marginVertical / 2}>
          <Text.Label
            align={'left'}
            width={'100%'}
            color={colors.inputSecondary}>
            {I18n.t('screens:deliver.modal.rejectTitle')}
          </Text.Label>
        </RowView>

        <RowView paddingBottom={defaults.marginVertical}>
          <Button.Outline
            borderColor={!reasonType ? colors.error : colors.primary}
            shadow
            title={
              !reasonType
                ? I18n.t('screens:deliver.modal.actionSheetPlaceholder')
                : reasonType.description
            }
            titleColor={colors.inputSecondary}
            onPress={openActionSheet.bind(null, {
              rejectReasons,
              updateTransientProps
            })}
            testID={'deliver-skip'}
          />
        </RowView>

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
            disabled={reasonMessage === '' || !reasonType}
            onPress={rejectAndNavigateBack.bind(
              null,
              setRejected.bind(
                null,
                selectedStop.orderId,
                selectedStop.key,
                outOfStockIds,
                reasonType,
                reasonMessage,
                hasCollectedEmpties
              ),
              setModalImageSrc,
              setModalText,
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

const showModal = ({
  imageSrc,
  setModalText,
  setModalImageSrc,
  setModalType,
  setModalVisible,
  text,
  type
}) => {
  setModalType(type);
  if (type === 'image') {
    setModalImageSrc(imageSrc);
    setModalText(text);
  }
  setModalVisible(true);
};

const { width, height } = deviceFrame();

const orderTitle = (order, bundledProducts) => {
  if (!order.isBundle) {
    return `${order.quantity} x ${order.title}`;
  }

  const title = Object.values(bundledProducts[order.productId]).map(
    el => `${order.quantity * el.quantity} x ${el.name}`
  );

  return title;
};

const Deliver = props => {
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [modalText, setModalText] = useState(null);
  const [modalType, setModalType] = useState('skip');
  const [modalVisible, setModalVisible] = useState(false);
  const [podPromptAutoShown, setPodPromptAutoShown] = useState(false);

  const [hasCollectedEmpties, setHasCollectedEmpties] = useState(null);

  const { colors } = useTheme();
  const {
    allItemsDone,
    bundledProducts,
    buttonAccessibility,
    confirmedItem,
    outOfStockIds,
    podImage,
    routeDescription,
    selectedStop,
    setDelivered,
    showPODRequired,
    toggleConfirmedItem,
    toggleModal,
    toggleOutOfStock,
    updateProps,
    position
  } = props;

  const acknowledgedList = selectedStop?.claims.acknowledgedList || [];
  const unacknowledgedList = selectedStop?.claims.unacknowledgedList || [];
  const showClaimModal = selectedStop?.claims.showClaimModal;

  const optimizedStopOrders = selectedStop
    ? Object.values(selectedStop.orderItems).map(order => {
        const isOutOfStock = outOfStockIds.includes(order.key);
        return {
          ...order,
          description: null,
          testID: `deliver-deliveryItemRow-${order.productId}`,
          title: orderTitle(order, bundledProducts),
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
          ...(isOutOfStock || order.status === 3
            ? {
                rightIconColor: colors.error,
                suffixColor: colors.error
              }
            : { rightIconColor: colors.success }),
          isDeliveryItem: true
        };
      })
    : null;

  if (
    selectedStop?.proofOfDeliveryRequired &&
    allItemsDone &&
    !podImage &&
    !modalVisible &&
    !podPromptAutoShown
  ) {
    setPodPromptAutoShown(true);
    podPrompt({
      proofOfDeliveryRequired: selectedStop?.proofOfDeliveryRequired,
      setModalImageSrc,
      setModalText,
      setModalType,
      setModalVisible,
      updateProps
    });
  }

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      if (showClaimModal) {
        NavigationService.navigate({
          routeName: 'CustomerIssueModal'
        });
      } else if (
        selectedStop?.proofOfDeliveryRequired &&
        unacknowledgedList.length === 0 &&
        selectedStop?.status === 'pending'
      ) {
        showPODRequired();
      }
    }
  }, [
    isFocused,
    selectedStop?.proofOfDeliveryRequired,
    selectedStop?.status,
    showClaimModal,
    showPODRequired,
    unacknowledgedList.length
  ]);

  if (!selectedStop) {
    return null;
  }

  const over20MetresAway =
    distance(
      { x: position.latitude, y: position.longitude },
      { x: selectedStop.latitude, y: selectedStop.longitude },
      'ME'
    ) > 20;

  return (
    <SafeAreaView>
      <Modal visible={modalVisible} transparent={true} animationType={'fade'}>
        {modalType === 'skip' &&
          renderSkipModal({
            colors,
            hasCollectedEmpties,
            ...props,
            setModalImageSrc,
            setModalText,
            setModalVisible,
            width
          })}
        {modalType === 'image' &&
          ImageTextModal({
            imageSource: {
              uri: modalImageSrc
            },
            onPress: setModalVisible,
            renderFallback: renderFallbackCustomerImage.bind(null, width),
            text: modalText
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
          rightColor={
            unacknowledgedList.length === 0 ? colors.error : colors.input
          }
          rightAction={
            unacknowledgedList.length === 0
              ? NavigationService.navigate.bind(null, {
                  routeName: 'CustomerIssueList'
                })
              : mock
          }
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

        {over20MetresAway && (
          <>
            <Separator width={'100%'} />
            <RowView
              paddingVertical={defaults.marginHorizontal / 2}
              backgroundColor={colors.error}>
              <Text.Caption color={colors.whiteOnly}>
                {I18n.t(`screens:deliver.over20meters`)}
              </Text.Caption>
            </RowView>
          </>
        )}

        <RowView
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}
          marginVertical={defaults.marginVertical / 2}>
          <Text.Heading
            color={colors.inputSecondary}
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
                iconColor={colors.inputSecondary}
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
          <Text.Caption color={colors.inputSecondary} testID={'deliver-userId'}>
            {I18n.t('screens:deliver.userId', {
              userId: selectedStop?.userId
            })}
          </Text.Caption>
          <Text.Caption
            color={colors.inputSecondary}
            testID={'deliver-routeDescription'}>
            {I18n.t('screens:deliver.routeDescription', {
              routeDescription,
              interpolation: { escapeValue: false }
            })}
          </Text.Caption>
        </RowView>

        {selectedStop &&
          (selectedStop.deliveryInstructions || selectedStop.hasImage) && (
            <>
              <Separator />
              <ListHeader
                title={I18n.t('screens:deliver.customer.instructions')}
              />
              <Pressable
                onPress={showModal.bind(null, {
                  imageSrc: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_CUSTOMER_IMAGES}/${selectedStop.customerId}-${selectedStop.key}`,
                  text: selectedStop.deliveryInstructions,
                  type: 'image',
                  setModalImageSrc,
                  setModalText,
                  setModalType,
                  setModalVisible
                })}>
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
                    maxHeight={sizes.list.image * 2}
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
                      color={colors.inputSecondary}
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
              onLongPress={
                selectedStop?.satisfactionStatus === 5 ? mock : toggleOutOfStock
              }
              onPress={toggleConfirmedItem}
              renderItemSeparator={null}
              renderSectionFooter={null}
            />
          </>
        )}
      </ColumnView>
      <Separator width={'100%'} />
      {selectedStop && selectedStop.status === 'pending' && (
        <ColumnView width={'auto'} marginHorizontal={defaults.marginHorizontal}>
          <RowView
            width={'100%'}
            marginHorizontal={defaults.marginHorizontal}
            marginVertical={defaults.marginVertical / 2}
            justifyContent={'space-between'}>
            <Text.List color={colors.inputSecondary}>
              {I18n.t('screens:deliver.emptiesCollected')}
            </Text.List>

            <SegmentedControl
              buttons={[
                {
                  label: I18n.t('general:yes'),
                  value: true
                },
                {
                  label: I18n.t('general:no'),
                  value: false
                }
              ]}
              onPress={setHasCollectedEmpties}
              selected={hasCollectedEmpties}
            />
          </RowView>

          {unacknowledgedList.length > 0 && (
            <RowView marginVertical={defaults.marginVertical}>
              <Button.Secondary
                title={I18n.t('screens:deliver.viewClaims', {
                  claimNo: unacknowledgedList.length
                })}
                onPress={showClaims.bind(null, toggleModal)}
              />
            </RowView>
          )}
          {unacknowledgedList.length === 0 && (
            <>
              <RowView justifyContent={'space-between'}>
                {!podImage && (
                  <CustomIcon
                    onPress={podPrompt.bind(null, {
                      proofOfDeliveryRequired:
                        selectedStop.proofOfDeliveryRequired,
                      setModalImageSrc,
                      setModalText,
                      setModalType,
                      setModalVisible,
                      updateProps
                    })}
                    containerWidth={buttonAccessibility}
                    width={buttonAccessibility}
                    icon={'addPhoto'}
                    iconColor={
                      selectedStop.proofOfDeliveryRequired
                        ? colors.error
                        : colors.primary
                    }
                  />
                )}
                {podImage && (
                  <Pressable
                    key={'pod'}
                    style={[style.photoWrapper, { width: buttonAccessibility }]}
                    onPress={podPrompt.bind(null, {
                      podImage,
                      proofOfDeliveryRequired:
                        selectedStop.proofOfDeliveryRequired,
                      setModalImageSrc,
                      setModalText,
                      setModalType,
                      setModalVisible,
                      updateProps
                    })}>
                    <Image
                      source={{
                        uri: podImage.path
                      }}
                      style={{ borderRadius: defaults.borderRadius }}
                      width={buttonAccessibility}
                    />
                  </Pressable>
                )}
                <Button.Primary
                  title={I18n.t('general:done')}
                  onPress={NavigationService.goBack.bind(null, {
                    afterCallback: setDelivered.bind(
                      null,
                      selectedStop.orderId,
                      selectedStop.key,
                      outOfStockIds,
                      podImage,
                      hasCollectedEmpties
                    )
                  })}
                  disabled={
                    !allItemsDone ||
                    (selectedStop.proofOfDeliveryRequired && !podImage) ||
                    hasCollectedEmpties === null
                  }
                  width={
                    width -
                    buttonAccessibility -
                    defaults.marginHorizontal * 2.5
                  }
                  testID={'deliver-done'}
                />
              </RowView>
              <RowView marginVertical={defaults.marginVertical}>
                <Button.Outline
                  title={I18n.t('screens:deliver.skipDelivery')}
                  onPress={showModal.bind(null, {
                    type: 'skip',
                    setModalType,
                    setModalVisible
                  })}
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
  bundledProducts: PropTypes.object,
  buttonAccessibility: PropTypes.number,
  confirmedItem: PropTypes.array,
  outOfStockIds: PropTypes.array,
  podImage: PropTypes.object,
  position: PropTypes.object,
  reasonMessage: PropTypes.string,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  setDelivered: PropTypes.func,
  setRejected: PropTypes.func,
  showPODRequired: PropTypes.func,
  toggleConfirmedItem: PropTypes.func,
  toggleModal: PropTypes.func,
  toggleOutOfStock: PropTypes.func,
  updateProps: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Deliver.defaultProps = {
  allItemsDone: false,
  bundledProducts: {},
  confirmedItem: [],
  outOfStockIds: [],
  podImage: null,
  position: { latitude: 0, longitude: 0 },
  reasonMessage: '',
  routeDescription: null,
  selectedStop: {},
  setDelivered: mock,
  setRejected: mock,
  showPODRequired: mock,
  toggleConfirmedItem: mock,
  toggleModal: mock,
  toggleOutOfStock: mock,
  updateProps: mock,
  updateTransientProps: mock
};

export default Deliver;
