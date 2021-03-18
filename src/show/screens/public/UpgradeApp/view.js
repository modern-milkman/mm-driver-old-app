import React from 'react';
import PropTypes from 'prop-types';
import { Pressable } from 'react-native';

import I18n from 'Locales/I18n';
import { CarLogo } from 'Images';
import { Button, Text } from 'Components';
import { colors, defaults, sizes } from 'Theme';
import { ColumnView, FullView, RowView } from 'Containers';
import { openDriverUpdate, triggerDriverUpdate } from 'Helpers';

import style from './style';

const logoSize = 100;

const UpgradeApp = (props) => {
  const {
    appcenter,
    navigation: {
      state: { params }
    }
  } = props;

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

          {params?.minimumVersion && (
            <ColumnView marginTop={24}>
              <Text.Caption align={'center'}>
                {I18n.t('screens:upgradeApp.minimumVersion', {
                  minimumVersion: params.minimumVersion
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
  navigation: PropTypes.object
};

UpgradeApp.defaultProps = {
  navigation: {}
};

export default UpgradeApp;
