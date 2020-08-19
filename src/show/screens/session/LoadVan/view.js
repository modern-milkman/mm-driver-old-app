import React from 'react';
import PropTypes from 'prop-types';

import { mock } from 'Helpers';
import { colors } from 'Theme';
import I18n from 'Locales/I18n';
import { Button, Icon, List, Text } from 'Components';
import NavigationService from 'Navigation/service';
import { ColumnView, RowView, SafeAreaView } from 'Containers';

import style from './style';

const LoadVan = (props) => {
  const { groupedStock, itemCount, updateCurrentDayProps } = props;

  const doneLoadedVan = () => {
    updateCurrentDayProps({ deliveryStatus: 1 });
    NavigationService.goBack();
  };

  return (
    <SafeAreaView
      bottom
      style={[style.container, { backgroundColor: colors.standard }]}>
      <ColumnView flex={1} justifyContent={'flex-start'}>
        <ColumnView
          backgroundColor={colors.standard}
          justifyContent={'flex-start'}>
          <RowView
            justifyContent={'space-between'}
            height={44}
            alignItems={'center'}>
            <Icon
              name={'arrow-left'}
              color={colors.primary}
              size={24}
              containerSize={44}
              onPress={NavigationService.goBack}
            />

            <Text.Callout color={colors.black}>
              {itemCount} {I18n.t('screens:loadVan.title')}
            </Text.Callout>

            <ColumnView width={44} marginRight={15}>
              <Button.Plain
                title={I18n.t('screens:loadVan.done')}
                noMargin
                onPress={doneLoadedVan.bind(null)}
              />
            </ColumnView>
          </RowView>
        </ColumnView>

        <ColumnView flex={1}>
          <List items={groupedStock} />
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

LoadVan.propTypes = {
  itemCount: PropTypes.number,
  groupedStock: PropTypes.array,
  updateCurrentDayProps: PropTypes.func
};

LoadVan.defaultProps = {
  itemCount: 0,
  groupedStock: [],
  updateCurrentDayProps: mock
};

export default LoadVan;
