import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Logo } from 'Images';
import I18n from 'Locales/I18n';
import { defaults } from 'Theme';
import { openTerms, mock } from 'Helpers';
import { Button, Switch, Text } from 'Components';
import { ColumnView, FullView, RowView, useTheme } from 'Containers';

const logoSize = 100;

const AcceptTerms = ({
  acceptTerms = mock,
  acceptedTermsVersion = 0,
  logout = mock,
  minimumTermsVersion = 0,
  processing = false,
  updateInAppBrowserProps = mock
}) => {
  const { colors } = useTheme();
  const [newTermsAgreed, setNewTermsAgreed] = useState(false);
  const termsType = acceptedTermsVersion === 0 ? 'new' : 'updated';

  return (
    <FullView bgColor={colors.primary}>
      <ColumnView flex={1} justifyContent={'center'}>
        <ColumnView marginVertical={defaults.marginVertical}>
          <Logo width={logoSize} />
        </ColumnView>
        <ColumnView height={Text.Heading.height}>
          <Text.Heading color={colors.white}>
            {I18n.t('screens:acceptTerms.title')}
          </Text.Heading>
        </ColumnView>
        <ColumnView
          marginTop={defaults.marginVertical}
          width={'auto'}
          marginHorizontal={defaults.marginHorizontal}>
          <Text.List color={colors.white} align={'left'}>
            {I18n.t(`screens:acceptTerms.description.${termsType}.prefix`)}
            <Text.List
              underline
              align={'left'}
              onPress={openTerms.bind(null, { updateInAppBrowserProps })}>
              {I18n.t('screens:acceptTerms.title')}
            </Text.List>
            {I18n.t(`screens:acceptTerms.description.${termsType}.suffix`)}
          </Text.List>

          <RowView marginVertical={defaults.marginVertical}>
            <ColumnView flex={1} alignItems={'flex-start'}>
              <Text.List>
                {`${I18n.t(
                  `screens:acceptTerms.description.${termsType}.agreement`
                )} ${I18n.t('screens:acceptTerms.title')}`}
              </Text.List>
            </ColumnView>

            <Switch value={newTermsAgreed} onValueChange={setNewTermsAgreed} />
          </RowView>

          <Button.Secondary
            title={I18n.t('general:continue')}
            onPress={acceptTerms.bind(null, minimumTermsVersion)}
            disabled={processing || !newTermsAgreed}
            processing={processing}
          />
          <Text.Caption
            marginVertical={defaults.marginVertical}
            onPress={logout}
            color={colors.inputSecondary}>
            {I18n.t('general:logout')}
          </Text.Caption>
        </ColumnView>
      </ColumnView>
    </FullView>
  );
};

AcceptTerms.propTypes = {
  acceptTerms: PropTypes.func,
  acceptedTermsVersion: PropTypes.number,
  logout: PropTypes.func,
  minimumTermsVersion: PropTypes.number,
  processing: PropTypes.bool,
  updateInAppBrowserProps: PropTypes.func
};

export default AcceptTerms;
