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
import { deliveredStatuses, deviceFrame, distance, mock } from 'Helpers';
import {
  Button,
  Camera,
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

const handlePodCameraOpen = ({ setModalType, setModalVisible }) => {
  setModalType('pod');
  setModalVisible(true);
};

const handleOOSQuantitySelection = (
  text,
  setQuantityEnterForStock,
  setErrorMessageOfOutofStock
) => {
  setErrorMessageOfOutofStock(false);
  setQuantityEnterForStock(text);
};

const handleListItemOnPress = (
  {
    confirmedItem,
    selectedStop,
    setModalVisible,
    setModalType,
    toggleConfirmedItem
  },
  orderId
) => {
  if (
    selectedStop.orderItems[orderId].barcodeValue &&
    selectedStop.orderItems[orderId].barcodeScanMandatory &&
    !confirmedItem.includes(orderId)
  ) {
    showBarCodeScanner({
      confirmedItem,
      orderId,
      setModalVisible,
      setModalType,
      showModal,
      toggleConfirmedItem
    });
  } else {
    toggleConfirmedItem(orderId);
  }
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

const openConfiguredCamera = ({
  deletePodImage,
  index,
  podImages,
  setModalImageSrc,
  setModalText,
  setModalType,
  setModalVisible
}) => {
  const pickerOptions = {};
  pickerOptions[I18n.t('general:reviewPhoto')] = showModal.bind(null, {
    imageSrc: podImages[index].uri,
    text: null,
    type: 'image',
    setModalImageSrc,
    setModalText,
    setModalType,
    setModalVisible
  });
  pickerOptions[I18n.t('general:deletePhoto')] = deletePodImage.bind(
    null,
    index
  );
  actionSheet(pickerOptions, { destructiveButtonIndex: 2 });
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

const doneOnOverStock = (
  setModalVisible,
  setSelectedItemQty,
  setSelectedItemOrderId,
  selectedItemOrderId,
  selectedItemQty,
  quantityEnterForStock,
  toggleOutOfStock,
  setErrorMessageOfOutofStock,
  confirmedItem,
  selectedStop,
  setModalType,
  toggleConfirmedItem
) => {
  const numericQuantity = Number.parseInt(quantityEnterForStock);
  if (
    quantityEnterForStock.length > 0 &&
    quantityEnterForStock < selectedItemQty
  ) {
    setErrorMessageOfOutofStock(false);
    setModalVisible(false);
    let finalQtyForOutOfStock =
      Number.parseInt(selectedItemQty) - numericQuantity;
    toggleOutOfStock(
      selectedItemOrderId,
      selectedItemOrderId,
      finalQtyForOutOfStock
    );
  } else if (quantityEnterForStock === selectedItemQty) {
    setErrorMessageOfOutofStock(false);
    setModalVisible(false);
    handleListItemOnPress(
      {
        confirmedItem,
        selectedStop,
        setModalVisible,
        setModalType,
        toggleConfirmedItem
      },
      selectedItemOrderId
    );
  } else {
    setErrorMessageOfOutofStock(true);
  }
};
const cancelOnOverStock = (
  setModalVisible,
  setSelectedItemQty,
  setSelectedItemOrderId,
  setErrorMessageOfOutofStock
) => {
  setModalVisible(false);
  setSelectedItemQty(0);
  setSelectedItemOrderId(0);
  setErrorMessageOfOutofStock(false);
};

const renderBarCodeScanner = ({ scanBarcode, setModalVisible }) => {
  return (
    <Camera
      onClosePress={setModalVisible.bind(null, false)}
      onSave={scanBarcode}
      showBarCodeScanner
      showRegularControls={false}
    />
  );
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

const renderPodImage = (
  {
    buttonAccessibility,
    deletePodImage,
    podImages,
    setModalImageSrc,
    setModalText,
    setModalType,
    setModalVisible
  },
  podImage,
  index
) => (
  <Pressable
    key={`podImage-${index}`}
    style={[style.photoWrapper, { width: buttonAccessibility }]}
    onPress={openConfiguredCamera.bind(null, {
      deletePodImage,
      index,
      podImages,
      setModalImageSrc,
      setModalText,
      setModalType,
      setModalVisible
    })}>
    <Image
      source={{
        uri: podImage.uri
      }}
      style={{ borderRadius: defaults.borderRadius }}
      width={buttonAccessibility}
    />
  </Pressable>
);

const renderPodImages = ({
  buttonAccessibility,
  colors,
  deletePodImage,
  podImages,
  selectedStop,
  setModalImageSrc,
  setModalText,
  setModalType,
  setModalVisible
}) => {
  return (
    <>
      {podImages.map(
        renderPodImage.bind(null, {
          buttonAccessibility,
          deletePodImage,
          podImages,
          setModalImageSrc,
          setModalText,
          setModalType,
          setModalVisible
        })
      )}
      {podImages.length < 2 && (
        <CustomIcon
          onPress={handlePodCameraOpen.bind(null, {
            setModalType,
            setModalVisible
          })}
          containerWidth={buttonAccessibility}
          width={buttonAccessibility}
          icon={'addPhoto'}
          iconColor={
            selectedStop.proofOfDeliveryRequired ? colors.error : colors.primary
          }
        />
      )}
    </>
  );
};

const renderSkipModal = ({
  colors,
  hasCollectedEmpties,
  outOfStockIds,
  outOfStockIdsList,
  reasonMessage = '',
  rejectReasons,
  selectedStop,
  setModalImageSrc,
  setModalText,
  setModalVisible,
  setRejected,
  reasonType,
  updateTransientProps = mock,
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
                hasCollectedEmpties,
                outOfStockIdsList
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

//For Out of Stock
const renderTextBoxModal = ({
  colors,
  orderId,
  selectedStop,
  setModalVisible,
  width,
  setSelectedItemQty,
  setSelectedItemOrderId,
  selectedItemOrderId,
  selectedItemQty,
  quantityEnterForStock,
  setQuantityEnterForStock,
  toggleOutOfStock,
  setErrorMessageOfOutofStock,
  isShowErrorMessageOfOutofStock,
  confirmedItem,
  setModalType,
  toggleConfirmedItem
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
      <RowView
        justifyContent={'flex-start'}
        marginTop={defaults.marginVertical}
        marginHorizontal={defaults.marginHorizontal}>
        <Text.Label align={'left'} width={'100%'} color={colors.inputSecondary}>
          {I18n.t('screens:deliver.enterOOSQuantityPlaceholder')}
        </Text.Label>
      </RowView>
      <ColumnView
        paddingHorizontal={defaults.marginHorizontal}
        paddingVertical={defaults.marginVertical}>
        <TextInput
          disableErrors
          keyboardType={'numeric'}
          value={quantityEnterForStock}
          placeholder={I18n.t(
            'screens:deliver.enterOOSQuantityPlaceholderText'
          )}
          error={isShowErrorMessageOfOutofStock ? true : false}
          errorMessage={'testttt'}
          onChangeText={text =>
            handleOOSQuantitySelection(
              text,
              setQuantityEnterForStock,
              setErrorMessageOfOutofStock
            )
          }
        />
        {isShowErrorMessageOfOutofStock && quantityEnterForStock.length > 0 && (
          <Text.List
            align={'left'}
            width={'100%'}
            marginLeft={20}
            marginTop={10}
            textTransform={'lowercase'}
            color={'red'}>
            {I18n.t('screens:deliver.enterOOSQuantityPlaceholderError')}
          </Text.List>
        )}
        {isShowErrorMessageOfOutofStock &&
          quantityEnterForStock.length === 0 && (
            <Text.List
              align={'left'}
              width={'100%'}
              marginLeft={20}
              marginTop={10}
              textTransform={'lowercase'}
              color={'red'}>
              {I18n.t('screens:deliver.enterQuantityEmptyPlaceholderError')}
            </Text.List>
          )}
      </ColumnView>

      <Separator width={'100%'} />

      <RowView>
        <Button.Primary
          title={I18n.t('general:done')}
          onPress={doneOnOverStock.bind(
            null,
            setModalVisible,
            setSelectedItemQty,
            setSelectedItemOrderId,
            selectedItemOrderId,
            selectedItemQty,
            quantityEnterForStock,
            toggleOutOfStock,
            setErrorMessageOfOutofStock,
            confirmedItem,
            selectedStop,
            setModalType,
            toggleConfirmedItem
          )}
          width={'50%'}
          noBorderRadius
        />
        <Button.Tertiary
          title={I18n.t('general:cancel')}
          onPress={cancelOnOverStock.bind(
            null,
            setModalVisible,
            setSelectedItemQty,
            setSelectedItemOrderId,
            setErrorMessageOfOutofStock
          )}
          width={'50%'}
          noBorderRadius
        />
      </RowView>
    </ColumnView>
  </ColumnView>
);

//For Out of Stock
const showTextBoxModal = (
  {
    selectedStop,
    setModalVisible,
    type,
    setModalType,
    setSelectedItemOrderId,
    setSelectedItemQty,
    setQuantityEnterForStock,
    outOfStockIdsList
  },
  orderId
) => {
  if (outOfStockIdsList.length > 0) {
    let indexExist = outOfStockIdsList.findIndex(x => x.id === orderId);
    if (indexExist !== -1) {
      let lastEnteredQty =
        selectedStop.orderItems[orderId].quantity -
        outOfStockIdsList[indexExist].quantity;
      setQuantityEnterForStock(lastEnteredQty + '');
    } else {
      setQuantityEnterForStock('0');
    }
  } else {
    setQuantityEnterForStock('0');
  }

  setSelectedItemQty(selectedStop.orderItems[orderId].quantity);
  setSelectedItemOrderId(orderId);
  setModalType(type);
  setModalVisible(true);
};

const showBarCodeScanner = ({
  confirmedItem,
  orderId,
  setModalVisible,
  setModalType,
  showModal,
  toggleConfirmedItem
}) => {
  if (!confirmedItem.includes(orderId)) {
    showModal({
      setModalVisible,
      setModalType,
      type: 'barcode'
    });
  } else {
    toggleConfirmedItem(orderId);
  }
};

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

const orderTitle = (order, bundledProducts) => {
  if (!order.isBundle) {
    return `${order.quantity} x ${order.title}`;
  }

  const title = Object.values(bundledProducts[order.productId]).map(
    el => `${order.quantity * el.quantity} x ${el.name}`
  );

  return title;
};

const { width, height } = deviceFrame();

const Deliver = props => {
  const {
    addPodImage = mock,
    allItemsDone = false,
    bundledProducts = {},
    buttonAccessibility = sizes.button.large,
    confirmedItem = [],
    distanceToPin = 40000,
    deletePodImage = mock,
    largerDeliveryText = false,
    outOfStockIds = [],
    outOfStockIdsList = [],
    podImages = [],
    position = { latitude: 0, longitude: 0 },
    routeDescription = null,
    scanBarcode = mock,
    selectedStop = {},
    setDelivered = mock,
    showPODRequired = mock,
    toggleConfirmedItem = mock,
    toggleModal = mock,
    toggleOutOfStock = mock
  } = props;

  const { colors } = useTheme();
  const [hasCollectedEmpties, setHasCollectedEmpties] = useState(null);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [modalText, setModalText] = useState(null);
  const [modalType, setModalType] = useState('skip');
  const [modalVisible, setModalVisible] = useState(false);
  const [podPromptAutoShown, setPodPromptAutoShown] = useState(false);
  const [selectedItemQty, setSelectedItemQty] = useState(0);
  const [selectedItemOrderId, setSelectedItemOrderId] = useState(0);
  const [quantityEnterForStock, setQuantityEnterForStock] = useState('0');
  const [isShowErrorMessageOfOutofStock, setErrorMessageOfOutofStock] =
    useState(false);

  const showClaimModal = selectedStop?.claims.showClaimModal;
  const isFocused = useIsFocused();

  const acknowledgedList = Object.values(
    selectedStop?.claims.acknowledgedClaims || {}
  );
  const unacknowledgedList = Object.values(
    selectedStop?.claims.unacknowledgedClaims || {}
  );

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

  //This will prevent whitescreen and failcase if selectStop will be undefined / null after setDelivered is made and autoselectopen is true and it will triger the navigation to Deliver screen
  if (!selectedStop) {
    return null;
  }

  const optimizedStopOrders = selectedStop
    ? Object.values(selectedStop.orderItems).map(order => {
        const isOutOfStock = outOfStockIds.includes(order.key);
        outOfStockIdsList.includes(order.key);
        return {
          ...order,
          description: null,
          testID: `deliver-deliveryItemRow-${order.productId}`,
          title: null,
          prefix: orderTitle(order, bundledProducts),
          PrefixTextComponent: largerDeliveryText ? Text.Tab : Text.List,
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
                : order.barcodeValue
                  ? 'barcode'
                  : null,
          rightIconOnPress: showBarCodeScanner.bind(null, {
            confirmedItem,
            orderId: order.key,
            setModalVisible,
            setModalType,
            showModal,
            toggleConfirmedItem
          }),
          enforceLayout: true,
          ...(isOutOfStock ||
          order.status === 3 ||
          (order.barcodeValue &&
            order.barcodeScanMandatory &&
            !confirmedItem.includes(order.key))
            ? {
                rightIconColor: colors.error,
                suffixColor: colors.error
              }
            : order.status === 1 &&
                order.barcodeValue &&
                !confirmedItem.includes(order.key)
              ? { rightIconColor: colors.primary }
              : { rightIconColor: colors.success }),
          isDeliveryItem: true
        };
      })
    : null;

  if (
    selectedStop?.proofOfDeliveryRequired &&
    allItemsDone &&
    podImages.length === 0 &&
    !modalVisible &&
    !podPromptAutoShown &&
    hasCollectedEmpties !== null
  ) {
    setPodPromptAutoShown(true);
    showPODRequired();
  }

  const overXMetresAway =
    distance(
      { x: position.latitude, y: position.longitude },
      { x: selectedStop.latitude, y: selectedStop.longitude },
      'ME'
    ) > distanceToPin;

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
        {modalType === 'barcode' &&
          renderBarCodeScanner({
            scanBarcode,
            setModalVisible
          })}
        {modalType === 'pod' && (
          <Camera
            onClosePress={setModalVisible.bind(null, false)}
            onSave={addPodImage}
            squareImage
          />
        )}
        {modalType === 'outOfStock' &&
          renderTextBoxModal({
            colors,
            ...props,
            setModalText,
            setModalVisible,
            width,
            setSelectedItemQty,
            setSelectedItemOrderId,
            selectedItemOrderId,
            selectedItemQty,
            quantityEnterForStock,
            setQuantityEnterForStock,
            toggleOutOfStock,
            setErrorMessageOfOutofStock,
            isShowErrorMessageOfOutofStock,
            confirmedItem,
            setModalType,
            toggleConfirmedItem,
            selectedStop
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
          {...((acknowledgedList.length > 0 ||
            unacknowledgedList.length > 0) && {
            rightCustomIcon: 'customerIssue',
            rightColor:
              unacknowledgedList.length > 0 ? colors.error : colors.primary,
            rightAction:
              unacknowledgedList.length > 0
                ? showClaims.bind(null, toggleModal)
                : NavigationService.navigate.bind(null, {
                    routeName: 'CustomerIssueList'
                  })
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

        {overXMetresAway && (
          <>
            <Separator width={'100%'} />
            <RowView
              paddingVertical={defaults.marginHorizontal / 2}
              backgroundColor={colors.error}>
              <Text.Caption color={colors.whiteOnly}>
                {I18n.t('screens:deliver.overXmeters', {
                  distance: distanceToPin
                })}
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
              // onLongPress={toggleOutOfStock}

              onLongPress={showTextBoxModal.bind(null, {
                selectedStop,
                setModalVisible,
                type: 'outOfStock',
                setModalType,
                setSelectedItemOrderId,
                setSelectedItemQty,
                setQuantityEnterForStock,
                outOfStockIdsList
              })}
              onPress={handleListItemOnPress.bind(null, {
                confirmedItem,
                selectedStop,
                setModalVisible,
                setModalType,
                toggleConfirmedItem
              })}
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
                {renderPodImages({
                  buttonAccessibility,
                  colors,
                  deletePodImage,
                  podImages,
                  selectedStop,
                  setModalImageSrc,
                  setModalText,
                  setModalType,
                  setModalVisible
                })}
                <Button.Primary
                  title={I18n.t('general:done')}
                  onPress={NavigationService.goBack.bind(null, {
                    afterCallback: setDelivered.bind(
                      null,
                      selectedStop.orderId,
                      selectedStop.key,
                      outOfStockIds,
                      podImages,
                      hasCollectedEmpties,
                      outOfStockIdsList
                    )
                  })}
                  disabled={
                    !allItemsDone ||
                    (selectedStop.proofOfDeliveryRequired &&
                      podImages.length === 0) ||
                    hasCollectedEmpties === null
                  }
                  width={
                    width -
                    defaults.marginHorizontal * 2 -
                    Math.min(podImages.length + 1, 2) * buttonAccessibility -
                    Math.min(podImages.length + 1, 2) *
                      0.5 *
                      defaults.marginHorizontal
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
  addPodImage: PropTypes.func,
  allItemsDone: PropTypes.bool,
  bundledProducts: PropTypes.object,
  buttonAccessibility: PropTypes.number,
  confirmedItem: PropTypes.array,
  deletePodImage: PropTypes.func,
  distanceToPin: PropTypes.number,
  largerDeliveryText: PropTypes.bool,
  outOfStockIds: PropTypes.array,
  outOfStockIdsList: PropTypes.array,
  podImage: PropTypes.object,
  podImages: PropTypes.array,
  position: PropTypes.object,
  reasonMessage: PropTypes.string,
  routeDescription: PropTypes.string,
  scanBarcode: PropTypes.func,
  selectedStop: PropTypes.object,
  setDelivered: PropTypes.func,
  setRejected: PropTypes.func,
  showPODRequired: PropTypes.func,
  toggleConfirmedItem: PropTypes.func,
  toggleModal: PropTypes.func,
  toggleOutOfStock: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default Deliver;
