import React from 'react';
import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { colors } from 'Theme';
import { List, NavBar } from 'Components';
import NavigationService from 'Navigation/service';
import { ColumnView, SafeAreaView } from 'Containers';

const doneLoadedVan = (updateChecklistProps, updateDriverActivity) => {
  updateChecklistProps({ loadedVan: true });
  updateDriverActivity();
  NavigationService.goBack();
};

const LoadVan = props => {
  const {
    additionalItemCount,
    deliveredStock,
    itemCount,
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
    return {
      ...stockItem,
      suffixTop: readOnly
        ? `${
            stockItem.quantity - (deliveredStock[stockItem.key] || 0)
          } / ${combinedItemQuantity}`
        : combinedItemQuantity,
      image: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${stockItem.productId}`,
      customIcon: 'productPlaceholder'
    };
  });

  const combinedItemCount = additionalItemCount
    ? `${itemCount} (${additionalItemCount})`
    : itemCount;

  return (
    <SafeAreaView top bottom>
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
          rightAction={doneLoadedVan.bind(
            null,
            updateChecklistProps,
            updateDriverActivity
          )}
        />
        <List data={mappedStock} />
      </ColumnView>
    </SafeAreaView>
  );
};

LoadVan.propTypes = {
  additionalItemCount: PropTypes.number,
  deliveredStock: PropTypes.object,
  itemCount: PropTypes.number,
  orderedStock: PropTypes.array,
  readOnly: PropTypes.bool,
  updateChecklistProps: PropTypes.func,
  updateDriverActivity: PropTypes.func
};

LoadVan.defaultProps = {
  additionalItemCount: 0,
  deliveredStock: {},
  itemCount: 0,
  orderedStock: [],
  readOnly: false,
  updateChecklistProps: mock,
  updateDriverActivity: mock
};

export default LoadVan;
