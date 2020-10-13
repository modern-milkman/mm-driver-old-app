import React from 'react';
import PropTypes from 'prop-types';

import { colors } from 'Theme';
import I18n from 'Locales/I18n';
import { CarLogo } from 'Images';
import { Text } from 'Components';
import { ColumnView, FullView } from 'Containers';

const logoSize = 100;

const UpgradeApp = (props) => {
  const { params } = props.navigation.state;

  return (
    <FullView bgColor={colors.primary}>
      <ColumnView flex={1} justifyContent={'center'}>
        <CarLogo
          width={logoSize}
          disabled
          fill={colors.white}
          primaryFill={colors.primary}
        />
        <ColumnView height={Text.Heading.height}>
          <Text.Heading color={colors.white}>
            {I18n.t('screens:home.driver')}
          </Text.Heading>
        </ColumnView>
        <ColumnView marginTop={24} width={'auto'} marginHorizontal={24}>
          <Text.List color={colors.white} align={'center'}>
            {I18n.t('screens:upgradeApp.description')}
          </Text.List>

          {params.minimumVersion && (
            <ColumnView marginTop={24}>
              <Text.Caption align={'center'} marginTop={24}>
                {I18n.t('screens:upgradeApp.minimumVersion', {
                  minimumVersion: params.minimumVersion
                })}
              </Text.Caption>
            </ColumnView>
          )}
        </ColumnView>
      </ColumnView>
    </FullView>
  );
};

UpgradeApp.propTypes = {
  navigation: PropTypes.object
};

UpgradeApp.defaultProps = {
  navigation: {}
};

export default UpgradeApp;
