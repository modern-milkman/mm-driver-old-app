import React from 'react';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';

import I18n from 'Locales/I18n';
import { CarLogo } from 'Images';
import { colors, defaults } from 'Theme';
import { ListItem, Text } from 'Components';
import { ColumnView, FullView } from 'Containers';

const logoSize = 100;

const PermissionsMissing = props => {
  const {} = props;

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
        <ColumnView height={Text.Heading.height}>
          <Text.Heading color={colors.white}>
            {I18n.t('screens:permissionsMissing.title')}
          </Text.Heading>
        </ColumnView>

        <ColumnView
          marginVertical={defaults.marginVertical}
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}>
          <Text.List align={'left'} color={colors.white}>
            {I18n.t('screens:permissionsMissing.description')}
          </Text.List>
        </ColumnView>
        <ListItem
          customIcon={'location'}
          customIconProps={{ color: colors.white }}
          description={`${I18n.t(
            'ios:NSLocationWhenInUseUsageDescription'
          )} ${I18n.t(
            `screens:permissionsMissing.instructions.location.${Platform.OS}`
          )}`}
          descriptionColor={colors.secondaryDark}
          disabled
          title={I18n.t('general:location')}
          titleColor={colors.white}
        />
        <ColumnView
          marginVertical={defaults.marginVertical}
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}>
          <Text.List align={'left'} color={colors.white}>
            {I18n.t('screens:permissionsMissing.instructions.general')}
          </Text.List>
        </ColumnView>
      </ColumnView>
    </FullView>
  );
};

PermissionsMissing.propTypes = {
  appcenter: PropTypes.object,
  navigation: PropTypes.object
};

PermissionsMissing.defaultProps = {
  navigation: {}
};

export default PermissionsMissing;
