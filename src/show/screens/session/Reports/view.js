import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import NavigationService from 'Navigation/service';
import { ColumnView, SafeAreaView } from 'Containers';
import { NavBar, Text } from 'Components';

const Reports = ({ network }) => {
  return (
    <SafeAreaView top bottom>
      <ColumnView
        flex={1}
        justifyContent={'flex-start'}
        alignItems={'stretch'}
        backgroundColor={colors.neutral}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          title={I18n.t('routes:reports')}
          marginHorizontal={defaults.marginHorizontal / 3}
        />

        <ColumnView paddingTop={20} alignItems={'flex-start'}>
          <Text.Heading color={'black'}>
            Is Connected : {JSON.stringify(network.isConnected)}
          </Text.Heading>
          <Text.Heading color={'black'}>
            Network Status : {JSON.stringify(network.status)}
          </Text.Heading>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

Reports.propTypes = {
  network: PropTypes.object
};

Reports.defaultProps = {};

export default Reports;
