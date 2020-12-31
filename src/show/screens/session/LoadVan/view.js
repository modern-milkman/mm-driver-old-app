import React from 'react';
import PropTypes from 'prop-types';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import { List, NavBar, Text } from 'Components';
import NavigationService from 'Navigation/service';
import { ColumnView, SafeAreaView } from 'Containers';

const LoadVan = (props) => {
  const { itemCount, orderedStock, readOnly, updateCurrentDayProps } = props;

  const doneLoadedVan = () => {
    updateCurrentDayProps({ deliveryStatus: 1 });
    NavigationService.goBack();
  };

  const doneButton = () => (
    <ColumnView
      width={60}
      alignItems={'flex-end'}
      justifyContent={'center'}
      height={defaults.topNavigation.height}>
      <Text.Label
        color={colors.primary}
        onPress={doneLoadedVan.bind(null)}
        align={'right'}
        lineHeight={defaults.topNavigation.height}>
        {I18n.t('screens:loadVan.done')}
      </Text.Label>
    </ColumnView>
  );

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
          RightComponent={readOnly ? null : doneButton}
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
  updateCurrentDayProps: PropTypes.func
};

LoadVan.defaultProps = {
  itemCount: 0,
  orderedStock: [],
  readOnly: false,
  updateCurrentDayProps: mock
};

export default LoadVan;
