import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import { Pressable } from 'react-native';
import { Camera, FlashMode } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { defaults, sizes } from 'Theme';
import { ImageTextModal } from 'Renders';
import actionSheet from 'Services/actionSheet';
import NavigationService from 'Services/navigation';
import Analytics, { EVENTS } from 'Services/analytics';
import { deliveredStatuses, deviceFrame, mock } from 'Helpers';
import { ColumnView, Modal, RowView, SafeAreaView, useTheme } from 'Containers';
import {
  Button,
  Image,
  List,
  ListHeader,
  NavBar,
  SegmentedControl,
  Separator,
  Text,
  TextInput,
  Icon
} from 'Components';

import style from './style';

const reasonMessageRef = React.createRef();

const focusReasonMessage = () => {
  reasonMessageRef?.current?.focus();
};

const handleBarCodeScanned = (
  { setModalVisible, scanExternalReference, orderId, setManuallyTypedBarcode },
  { data }
) => {
  setModalVisible(false);
  setManuallyTypedBarcode('');
  scanExternalReference(data, orderId);
};

const handleChangeSkip = (updateTransientProps, key, value) => {
  updateTransientProps({ [key]: value });
  focusReasonMessage();
};

const handleListItemOnPress = (
  {
    confirmedItem,
    selectedStop,
    setModalVisible,
    setModalType,
    setScanningOrderId,
    toggleConfirmedItem
  },
  orderId
) => {
  if (
    selectedStop?.satisfactionStatus === 5 &&
    !confirmedItem.includes(orderId)
  ) {
    showBarCodeScanner({
      confirmedItem,
      orderId,
      setModalVisible,
      setModalType,
      setScanningOrderId,
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

const openCamera = ({ addPodImage }) => {
  ImagePicker.openCamera({
    width: 1000,
    height: 1000,
    compressImageQuality: 0.6,
    cropping: true,
    includeBase64: true
  }).then(addPodImage);
  Analytics.trackEvent(EVENTS.IMAGE_PICKER_FROM_CAMERA);
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
    imageSrc: podImages[index].path,
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

const renderBarCodeScanner = ({
  buttonAccessibility,
  colors,
  manuallyTypedBarcode,
  scanExternalReference,
  orderId,
  selectedStop,
  setManuallyTypedBarcode,
  setModalVisible,
  setTorch,
  torch,
  unacknowledgedList
}) => {
  return (
    <>
      <SafeAreaView style={style.cameraScannerOverlay}>
        <ColumnView
          marginHorizontal={defaults.marginHorizontal}
          width={width - defaults.marginHorizontal * 2}
          flex={1}
          justifyContent={'space-between'}
          marginBottom={defaults.marginVertical}>
          <RowView justifyContent={'space-between'}>
            <Icon
              name={torch ? 'flashlight' : 'flashlight-off'}
              color={colors.inputSecondary}
              size={buttonAccessibility}
              containerSize={buttonAccessibility}
              onPress={setTorch.bind(null, !torch)}
            />
            <CustomIcon
              onPress={setModalVisible.bind(null, false)}
              containerWidth={buttonAccessibility}
              width={buttonAccessibility}
              icon={'close'}
              iconColor={
                selectedStop.proofOfDeliveryRequired
                  ? colors.error
                  : colors.primary
              }
            />
          </RowView>
          <ColumnView>
            <TextInput
              autoCapitalize={'none'}
              keyboardType={'numeric'}
              onChangeText={setManuallyTypedBarcode}
              onSubmitEditing={handleBarCodeScanned.bind(null, {
                setModalVisible,
                scanExternalReference,
                orderId,
                setManuallyTypedBarcode,
                manuallyTypedBarcode
              })}
              placeholder={I18n.t('screens:deliver.scanner.placeholder')}
              returnKeyType={'go'}
              value={manuallyTypedBarcode}
            />
            <Button.Primary
              title={I18n.t('screens:deliver.scanner.button', {
                claimNo: unacknowledgedList.length
              })}
              onPress={handleBarCodeScanned.bind(
                null,
                {
                  setModalVisible,
                  scanExternalReference,
                  orderId,
                  setManuallyTypedBarcode
                },
                { data: manuallyTypedBarcode }
              )}
              disabled={manuallyTypedBarcode === ''}
            />
          </ColumnView>
        </ColumnView>
      </SafeAreaView>
      <Camera
        flashMode={torch ? FlashMode.torch : FlashMode.off}
        onBarCodeScanned={handleBarCodeScanned.bind(null, {
          setModalVisible,
          scanExternalReference,
          orderId,
          setManuallyTypedBarcode
        })}
        style={style.cameraScanner}
      />
    </>
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
        uri: podImage.path
      }}
      style={{ borderRadius: defaults.borderRadius }}
      width={buttonAccessibility}
    />
  </Pressable>
);

const renderPodImages = ({
  addPodImage,
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
          onPress={openCamera.bind(null, {
            addPodImage
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

const showBarCodeScanner = ({
  confirmedItem,
  orderId,
  setModalVisible,
  setModalType,
  setScanningOrderId,
  showModal,
  toggleConfirmedItem
}) => {
  if (!confirmedItem.includes(orderId)) {
    showModal({
      orderId,
      setModalVisible,
      setModalType,
      setScanningOrderId,
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
  orderId,
  setModalText,
  setModalImageSrc,
  setModalType,
  setModalVisible,
  setScanningOrderId,
  text,
  type
}) => {
  setModalType(type);
  if (type === 'image') {
    setModalImageSrc(imageSrc);
    setModalText(text);
  }
  if (type === 'barcode') {
    setScanningOrderId(orderId);
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
    buttonAccessibility,
    confirmedItem = [],
    deletePodImage = mock,
    outOfStockIds = [],
    podImages = [],
    routeDescription = null,
    selectedStop = {},
    setDelivered = mock,
    showPODRequired = mock,
    toggleConfirmedItem = mock,
    toggleModal = mock,
    toggleOutOfStock = mock,
    scanExternalReference = mock
  } = props;

  const { colors } = useTheme();
  const [hasCollectedEmpties, setHasCollectedEmpties] = useState(null);
  const [manuallyTypedBarcode, setManuallyTypedBarcode] = useState('');
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [modalText, setModalText] = useState(null);
  const [modalType, setModalType] = useState('skip');
  const [modalVisible, setModalVisible] = useState(false);
  const [orderId, setScanningOrderId] = useState(null);
  const [podPromptAutoShown, setPodPromptAutoShown] = useState(false);
  const [torch, setTorch] = useState(false);

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
                : selectedStop?.satisfactionStatus === 5
                  ? 'barcode'
                  : null,
          enforceLayout: true,
          ...(isOutOfStock ||
          order.status === 3 ||
          (selectedStop?.satisfactionStatus === 5 &&
            !confirmedItem.includes(order.key))
            ? {
                rightIconColor: colors.error,
                suffixColor: colors.error
              }
            : { rightIconColor: colors.success }),
          isDeliveryItem: true,
          externalReference: selectedStop?.externalReference
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
            buttonAccessibility,
            colors,
            manuallyTypedBarcode,
            scanExternalReference,
            orderId,
            selectedStop,
            setManuallyTypedBarcode,
            setModalVisible,
            setTorch,
            torch,
            unacknowledgedList
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
              {...(selectedStop?.satisfactionStatus !== 5 && {
                onLongPress: toggleOutOfStock
              })}
              onPress={handleListItemOnPress.bind(null, {
                confirmedItem,
                selectedStop,
                setModalVisible,
                setModalType,
                setScanningOrderId,
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
                  addPodImage,
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
                      hasCollectedEmpties
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
  outOfStockIds: PropTypes.array,
  podImages: PropTypes.array,
  position: PropTypes.object,
  reasonMessage: PropTypes.string,
  routeDescription: PropTypes.string,
  scanExternalReference: PropTypes.func,
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

export default Deliver;
