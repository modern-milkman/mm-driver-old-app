import React from 'react';
import PropTypes from 'prop-types';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { colors } from 'Theme';
import { List, NavBar } from 'Components';
import NavigationService from 'Navigation/service';
import { ColumnView, SafeAreaView } from 'Containers';

const LoadVan = (props) => {
  const { itemCount, orderedStock, readOnly, updateChecklistProps } = props;

  const doneLoadedVan = () => {
    updateChecklistProps({ loadedVan: true });
    NavigationService.goBack();
  };

  return (
    <SafeAreaView top bottom>
      <ColumnView
        flex={1}
        justifyContent={'flex-start'}
        backgroundColor={colors.neutral}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          title={`${itemCount} ${I18n.t('screens:loadVan.title')}`}
          rightText={readOnly ? null : I18n.t('screens:loadVan.done')}
          rightAction={doneLoadedVan}
        />
        <List data={orderedStock} />
      </ColumnView>
    </SafeAreaView>
  );
};

LoadVan.propTypes = {
  itemCount: PropTypes.number,
  orderedStock: PropTypes.array,
  readOnly: PropTypes.bool,
  updateChecklistProps: PropTypes.func
};

LoadVan.defaultProps = {
  itemCount: 0,
  orderedStock: [],
  readOnly: false,
  updateChecklistProps: mock
};

export default LoadVan;
