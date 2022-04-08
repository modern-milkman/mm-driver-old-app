import React from 'react';
import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';

import I18n from 'Locales/I18n';
import { mock, toggle } from 'Helpers';
import { List, NavBar } from 'Components';
import NavigationService from 'Services/navigation';
import { ColumnView, SafeAreaView, useTheme } from 'Containers';

const doneLoadedVan = (updateChecklistProps, updateDriverActivity) => {
  updateChecklistProps({ loadedVan: true, loadedVanItems: [] });
  updateDriverActivity();
};

const toggleLoadedVanItem = ({ loadedVanItems, updateChecklistProps }, id) => {
  updateChecklistProps({ loadedVanItems: toggle(loadedVanItems, id) });
};

const LoadVan = props => {
  const { colors } = useTheme();
  const {
    additionalItemCount,
    deliveredStock,
    itemCount,
    loadedVanItems,
    orderedStock,
    readOnly,
    updateChecklistProps,
    updateDriverActivity
  } = props;

  let deliveredTotal = 0;
  const mappedStock = orderedStock.map(stockItem => {
    deliveredTotal += deliveredStock[stockItem.key] || 0;
    const combinedItemQuantity = stockItem.additionalQuantity
      ? `${stockItem.quantity} (${stockItem.additionalQuantity})`
      : stockItem.quantity;
    const isPicked = loadedVanItems?.includes(stockItem.key);
    return {
      ...stockItem,
      disabled: readOnly,
      suffixTop: readOnly
        ? `${
            stockItem.quantity - (deliveredStock[stockItem.key] || 0)
          } / ${combinedItemQuantity}`
        : combinedItemQuantity,
      image: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${stockItem.productId}`,
      customIcon: 'productPlaceholder',
      testID: `loadVan-product-${stockItem.productId}`,
      ...(isPicked && {
        rightIcon: 'check',
        rightIconColor: colors.success
      })
    };
  });

  const combinedItemCount = additionalItemCount
    ? `${itemCount} (${additionalItemCount})`
    : itemCount;

  const doneDisabled =
    Config.ENVIRONMENT === 'production' &&
    loadedVanItems?.length !== mappedStock.length;

  return (
    <SafeAreaView>
      <ColumnView
        flex={1}
        justifyContent={'flex-start'}
        backgroundColor={colors.neutral}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          title={`${
            readOnly
              ? `${itemCount - deliveredTotal} / ${combinedItemCount}`
              : combinedItemCount
          } ${I18n.t('screens:loadVan.title')}`}
          rightText={readOnly ? null : I18n.t('screens:loadVan.done')}
          rightColor={doneDisabled ? colors.input : colors.primary}
          rightAction={
            doneDisabled
              ? null
              : NavigationService.goBack.bind(null, {
                  beforeCallback: doneLoadedVan.bind(
                    null,
                    updateChecklistProps,
                    updateDriverActivity
                  )
                })
          }
          testID={'loadVan-navbar'}
        />
        <List
          data={mappedStock}
          onPress={toggleLoadedVanItem.bind(null, {
            loadedVanItems,
            updateChecklistProps
          })}
        />
      </ColumnView>
    </SafeAreaView>
  );
};

LoadVan.propTypes = {
  additionalItemCount: PropTypes.number,
  deliveredStock: PropTypes.object,
  itemCount: PropTypes.number,
  loadedVanItems: PropTypes.array,
  orderedStock: PropTypes.array,
  readOnly: PropTypes.bool,
  updateChecklistProps: PropTypes.func,
  updateDriverActivity: PropTypes.func
};

LoadVan.defaultProps = {
  additionalItemCount: 0,
  deliveredStock: {},
  itemCount: 0,
  loadedVanItems: [],
  orderedStock: [],
  readOnly: false,
  updateChecklistProps: mock,
  updateDriverActivity: mock
};

export default LoadVan;
