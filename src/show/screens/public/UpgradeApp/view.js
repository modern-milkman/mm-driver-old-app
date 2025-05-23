import React from 'react';
import PropTypes from 'prop-types';
import { Pressable } from 'react-native';

import I18n from 'Locales/I18n';
import { Logo } from 'Images';
import { defaults, sizes } from 'Theme';
import { Button, Text } from 'Components';
import { openDriverUpdate, triggerDriverUpdate } from 'Helpers';
import { ColumnView, FullView, RowView, useTheme } from 'Containers';

import style from './style';

const logoSize = 100;

const UpgradeApp = props => {
  const { colors } = useTheme();
  const { appcenter, minimumVersion } = props;

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
        <ColumnView
          marginTop={defaults.marginVertical}
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}>
          <Text.List color={colors.white} align={'left'}>
            {I18n.t('screens:upgradeApp.description')}
          </Text.List>

          {minimumVersion && (
            <ColumnView marginTop={defaults.marginVertical}>
              <Text.Caption align={'center'}>
                {I18n.t('screens:upgradeApp.minimumVersion', {
                  minimumVersion
                })}
              </Text.Caption>
            </ColumnView>
          )}

          {appcenter && appcenter?.download_url && appcenter?.short_version && (
            <ColumnView
              justifyContent={'space-between'}
              alignItems={'center'}
              height={Text.Button.height + sizes.button.small}
              marginVertical={defaults.marginVertical}>
              <Button.Tertiary
                title={I18n.t('screens:upgradeApp.download', {
                  version: appcenter.short_version
                })}
                onPress={triggerDriverUpdate.bind(null, appcenter.download_url)}
              />
              <RowView
                width={'100%'}
                height={sizes.button.small}
                justifyContent={'flex-start'}
                alignItems={'center'}>
                <Pressable
                  onPress={openDriverUpdate}
                  style={style.pressableContainer}>
                  <Text.Caption>
                    {I18n.t('screens:upgradeApp.other')}
                  </Text.Caption>
                </Pressable>
              </RowView>
            </ColumnView>
          )}
        </ColumnView>
      </ColumnView>
    </FullView>
  );
};

UpgradeApp.propTypes = {
  appcenter: PropTypes.object,
  minimumVersion: PropTypes.string
};

export default UpgradeApp;
