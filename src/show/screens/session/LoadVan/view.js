import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import React, { useState } from 'react';
import Config from 'react-native-config';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { Camera, List, NavBar } from 'Components';
import NavigationService from 'Services/navigation';
import { ColumnView, Modal, SafeAreaView, useTheme } from 'Containers';

const computeItemCount = ({
  barcodeItemCount,
  itemCount,
  TPLItemCount,
  type
}) => {
  switch (type) {
    case 'MM':
      return itemCount;
    case 'TPL':
      return TPLItemCount;
    default:
      return barcodeItemCount;
  }
};

const filterFunctions = {
  Barcode: element => element.barcodeScanMandatory,
  MM: element => !element.is3PL && !element.barcodeScanMandatory,
  TPL: element => element.is3PL && !element.barcodeScanMandatory
};

const handleBarCodeScanned = (
  { barcodeIds, loadedVanItems, updateChecklistProps, scanBarcodeError },
  data
) => {
  if (barcodeIds[data]) {
    setLoadedVanItemChecked({
      id: barcodeIds[data],
      loadedVanItems,
      updateChecklistProps
    });
  } else {
    scanBarcodeError();
  }
};

const handleListItemOnPress = (
  { loadedVanItems, setModalVisible, type, updateChecklistProps },
  id
) => {
  toggleLoadedVanItem({
    id,
    loadedVanItems,
    updateChecklistProps
  });
};
const handleBarcodeListItemOnPress = (
  { loadedVanItems, setModalVisible, type, updateChecklistProps },
  id
) => {
  if (type === 'Barcode' && !loadedVanItems[id]) {
    setModalVisible(true);
  } else {
    toggleLoadedVanItem({
      id,
      loadedVanItems,
      updateChecklistProps
    });
  }
};

const setLoadedVanItemChecked = ({
  id,
  loadedVanItems,
  updateChecklistProps
}) => {
  loadedVanItems = { ...loadedVanItems };
  loadedVanItems[id] = true;
  updateChecklistProps({ loadedVanItems });
};

const toggleLoadedVanItem = ({ id, loadedVanItems, updateChecklistProps }) => {
  loadedVanItems = { ...loadedVanItems };
  if (loadedVanItems[id]) {
    delete loadedVanItems[id];
  } else {
    loadedVanItems[id] = true;
  }
  updateChecklistProps({ loadedVanItems });
};

const LoadVan = props => {
  const { colors } = useTheme();
  const {
    additionalItemCount = 0,
    barcodeItemCount = 0,
    deliveredStock = {},
    itemCount = 0,
    loadedVanItems = {},
    orderedStock = [],
    readOnly = false,
    scanBarcodeError = mock,
    TPLItemCount = 0,
    type = 'MM',
    updateChecklistProps = mock
  } = props;

  const [modalVisible, setModalVisible] = useState(false);

  const barcodeIds = {};

  const computedItemCount = computeItemCount({
    barcodeItemCount,
    itemCount,
    TPLItemCount,
    type
  });

  let deliveredTotal = 0;
  let disableDoneButton = false;

  const mappedStock = orderedStock
    .filter(filterFunctions[type])
    .sort((a, b) => {
      const isAPicked = loadedVanItems[a.key];
      const isBPicked = loadedVanItems[b.key];
      return isAPicked - isBPicked;
    })
    .map(stockItem => {
      deliveredTotal += deliveredStock[stockItem.key] || 0;
      const combinedItemQuantity = stockItem.additionalQuantity
        ? `${stockItem.quantity} (${stockItem.additionalQuantity})`
        : stockItem.quantity;
      const isPicked = loadedVanItems[stockItem.key];
      if (!loadedVanItems[stockItem.key]) {
        disableDoneButton = true;
      }
      barcodeIds[stockItem.barcodeValue] = stockItem.key;
      return {
        ...stockItem,
        disabled: readOnly,
        suffixTop: readOnly
          ? `${stockItem.quantity - (deliveredStock[stockItem.key] || 0)} / ${combinedItemQuantity}`
          : combinedItemQuantity,
        image: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${stockItem.productId}`,
        customIcon: 'productPlaceholder',
        testID: `loadVan-product-${stockItem.productId}`,
        ...(isPicked && {
          rightIcon: 'check',
          rightIconColor: colors.success
        }),
        ...(!isPicked &&
          stockItem.barcodeScanMandatory &&
          stockItem.barcodeValue && {
            rightIcon: 'barcode',
            rightIconColor: colors.primary
          })
      };
    });
  const combinedItemCount = additionalItemCount
    ? `${computedItemCount} (${additionalItemCount})`
    : computedItemCount;

  const doneDisabled = Config.ENVIRONMENT === 'production' && disableDoneButton;

  return (
    <SafeAreaView>
      <Modal visible={modalVisible} transparent={true} animationType={'fade'}>
        <Camera
          onClosePress={setModalVisible.bind(null, false)}
          onSave={handleBarCodeScanned.bind(null, {
            barcodeIds,
            loadedVanItems,
            updateChecklistProps,
            scanBarcodeError
          })}
          showBarCodeScanner
          showRegularControls={false}
        />
      </Modal>
      <ColumnView
        flex={1}
        justifyContent={'flex-start'}
        backgroundColor={colors.neutral}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          title={`${
            readOnly
              ? `${computedItemCount - deliveredTotal} / ${combinedItemCount}`
              : combinedItemCount
          } ${I18n.t('screens:loadVan.title')}`}
          rightText={readOnly ? null : I18n.t('screens:loadVan.done')}
          rightColor={doneDisabled ? colors.input : colors.primary}
          rightAction={
            doneDisabled
              ? null
              : NavigationService.goBack.bind(null, {
                  beforeCallback: updateChecklistProps.bind(null, {
                    [`loadedVan${type}`]: true
                  })
                })
          }
          testID={'loadVan-navbar'}
        />
        {type === 'Barcode' ? (
          <List
            data={mappedStock}
            onPress={handleBarcodeListItemOnPress.bind(null, {
              loadedVanItems,
              setModalVisible,
              type,
              updateChecklistProps
            })}
            onLongPress={handleListItemOnPress.bind(null, {
              loadedVanItems,
              setModalVisible,
              type,
              updateChecklistProps
            })}
          />
        ) : (
          <List
            data={mappedStock}
            onPress={handleListItemOnPress.bind(null, {
              loadedVanItems,
              setModalVisible,
              type,
              updateChecklistProps
            })}
          />
        )}
      </ColumnView>
    </SafeAreaView>
  );
};

LoadVan.propTypes = {
  additionalItemCount: PropTypes.number,
  barcodeItemCount: PropTypes.number,
  deliveredStock: PropTypes.object,
  itemCount: PropTypes.number,
  loadedVanItems: PropTypes.object,
  orderedStock: PropTypes.array,
  readOnly: PropTypes.bool,
  scanBarcodeError: PropTypes.func,
  TPLItemCount: PropTypes.number,
  type: PropTypes.string,
  updateChecklistProps: PropTypes.func
};

export default LoadVan;
