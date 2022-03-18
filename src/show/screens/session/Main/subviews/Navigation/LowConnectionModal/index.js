import React from 'react';

import I18n from 'Locales/I18n';
import { deviceFrame } from 'Helpers';
import { defaults } from 'Theme';
import NavigationService from 'Services/navigation';
import { Button, Text, Icon, Separator } from 'Components';
import { ColumnView, RowView, useTheme } from 'Containers';

const { height } = deviceFrame();

const LowConnectionModal = () => {
  const { alphaColor, colors } = useTheme();
  return (
    <ColumnView flex={1} backgroundColor={alphaColor('input', 0.85)}>
      <ColumnView
        backgroundColor={'transparent'}
        marginHorizontal={defaults.marginHorizontal}
        width={'auto'}
        flex={1}>
        <ColumnView
          alignItems={'flex-start'}
          backgroundColor={colors.neutral}
          borderRadius={defaults.borderRadius}
          overflow={'hidden'}>
          <RowView
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingVertical={defaults.marginVertical / 2}>
            <RowView
              justifyContent={'flex-start'}
              flex={1}
              alignItems={'center'}>
              <Icon
                name={'wifi-strength-1-alert'}
                color={colors.warning}
                disabled
              />
              <Text.Heading color={colors.inputSecondary}>
                {I18n.t('screens:main.lowConnectionModal.title')}
              </Text.Heading>
            </RowView>
          </RowView>

          <Separator color={colors.input} width={'100%'} />

          <ColumnView
            justifyContent={'flex-start'}
            alignItems={'flex-start'}
            maxHeight={height * 0.4}
            paddingVertical={defaults.marginVertical / 2}
            paddingHorizontal={defaults.marginVertical / 2}>
            <Text.Caption color={colors.inputSecondary}>
              {I18n.t('screens:main.lowConnectionModal.description')}
            </Text.Caption>

            <RowView
              justifyContent={'flex-start'}
              paddingTop={defaults.marginVertical}
              paddingBottom={defaults.marginVertical / 4}
              alignItems={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:main.lowConnectionModal.whatToExpect')}
              </Text.List>
            </RowView>

            <Text.Caption color={colors.inputSecondary} textAlign={'left'}>
              {I18n.t('screens:main.lowConnectionModal.images')}
            </Text.Caption>

            <Text.Caption color={colors.inputSecondary}>
              {I18n.t('screens:main.lowConnectionModal.directions')}
            </Text.Caption>
            <Text.Caption color={colors.inputSecondary}>
              {I18n.t('screens:main.lowConnectionModal.pins')}
            </Text.Caption>
          </ColumnView>
          <Separator color={colors.input} width={'100%'} />
          <RowView>
            <Button.Tertiary
              title={I18n.t('general:ok')}
              onPress={NavigationService.goBack}
            />
          </RowView>
        </ColumnView>
      </ColumnView>
    </ColumnView>
  );
};

LowConnectionModal.propTypes = {};

LowConnectionModal.defaultProps = {};

export default LowConnectionModal;
