import React from 'react';
import { Platform } from 'react-native';

import I18n from 'Locales/I18n';
import { Logo } from 'Images';
import { colors, defaults } from 'Theme';
import { ListItem, Text } from 'Components';
import { ColumnView, FullView } from 'Containers';

const logoSize = 100;

const PermissionsMissing = () => {
  return (
    <FullView bgColor={colors.primary}>
      <ColumnView flex={1} justifyContent={'center'}>
        <ColumnView marginVertical={defaults.marginVertical}>
          <Logo width={logoSize} />
        </ColumnView>
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
        <ListItem
          customIcon={'addPhoto'}
          customIconProps={{ color: colors.white, bgColor: 'transparent' }}
          description={`${I18n.t('ios:NSCameraUsageDescription')} ${I18n.t(
            `screens:permissionsMissing.instructions.camera.${Platform.OS}`
          )}`}
          descriptionColor={colors.secondaryDark}
          disabled
          title={I18n.t('general:camera')}
          titleColor={colors.white}
        />
      </ColumnView>
    </FullView>
  );
};

PermissionsMissing.propTypes = {};

PermissionsMissing.defaultProps = {};

export default PermissionsMissing;
