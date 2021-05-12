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

const doneLoadedVan = (updateChecklistProps) => {
  updateChecklistProps({ loadedVan: true });
  NavigationService.goBack();
};

const LoadVan = (props) => {
  const {
    deliveredStock,
    itemCount,
    orderedStock,
    readOnly,
    updateChecklistProps
  } = props;

  let deliveredTotal = 0;
  const mappedStock = orderedStock.map((stockItem) => {
    deliveredTotal += deliveredStock[stockItem.key] || 0;
    return {
      ...stockItem,
      miscelaneousTop: readOnly
        ? `${stockItem.quantity - (deliveredStock[stockItem.key] || 0)} / ${
            stockItem.quantity
          }`
        : stockItem.quantity,
      image: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${stockItem.productId}`,
      customIcon: 'productPlaceholder'
    };
  });

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
              ? `${itemCount - deliveredTotal} / ${itemCount}`
              : itemCount
          } ${I18n.t('screens:loadVan.title')}`}
          rightText={readOnly ? null : I18n.t('screens:loadVan.done')}
          rightAction={doneLoadedVan.bind(null, updateChecklistProps)}
        />
        <List data={mappedStock} />
      </ColumnView>
    </SafeAreaView>
  );
};

LoadVan.propTypes = {
  deliveredStock: PropTypes.object,
  itemCount: PropTypes.number,
  orderedStock: PropTypes.array,
  readOnly: PropTypes.bool,
  updateChecklistProps: PropTypes.func
};

LoadVan.defaultProps = {
  deliveredStock: {},
  itemCount: 0,
  orderedStock: [],
  readOnly: false,
  updateChecklistProps: mock
};

export default LoadVan;
