import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import NavigationService from 'Navigation/service';
import { Button, List, NavBar } from 'Components';
import { ColumnView, RowView, SafeAreaView } from 'Containers';

import { renderProgressBar, triggerDriverConfirmations } from '../shared';

const nextStep = ({ payload, saveVehicleChecks, showMustComplyWithTerms }) => {
  if (payload.shiftStart) {
    triggerDriverConfirmations({ saveVehicleChecks, showMustComplyWithTerms });
  } else {
    saveVehicleChecks('shiftEndVanChecks');
  }
};

const Checklist = ({
  payload,
  processing,
  saveVehicleChecks,
  showMustComplyWithTerms,
  toggleCheckJson
}) => {
  const { checksJson } = payload;
  const skip = !Object.values(checksJson).some(item => item);
  const mainActionTitle = skip
    ? I18n.t('general:skip')
    : payload.shiftStart
    ? I18n.t('general:next')
    : I18n.t('general:done');
  const data = [];
  for (const [key, value] of Object.entries(checksJson)) {
    data.push({
      key,
      rightIcon: value ? 'check' : null,
      title: key,
      testID: `checkList-${key}-listItem`
    });
  }
  return (
    <SafeAreaView top bottom>
      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={!processing && NavigationService.goBack.bind()}
          {...(processing && { leftIconColor: colors.inputDark })}
          title={I18n.t('screens:checklist.title')}
          rightAction={nextStep.bind(null, {
            payload,
            saveVehicleChecks,
            showMustComplyWithTerms
          })}
          rightText={payload.shiftStart && !processing ? mainActionTitle : null}
          testID={'checkList-navbar'}
        />
        {renderProgressBar(payload.shiftStart ? 4 : 3, payload)}
        <ColumnView flex={1} justifyContent={'space-between'}>
          <List data={data} onPress={toggleCheckJson} disabled={processing} />
          <RowView
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}
            marginBottom={defaults.marginVertical}>
            <Button.Primary
              title={mainActionTitle}
              disabled={processing}
              processing={processing}
              onPress={nextStep.bind(null, {
                payload,
                saveVehicleChecks,
                showMustComplyWithTerms
              })}
              testID={'checkList-mainNext-btn'}
            />
          </RowView>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

Checklist.propTypes = {
  payload: PropTypes.object,
  processing: PropTypes.bool,
  saveVehicleChecks: PropTypes.func,
  showMustComplyWithTerms: PropTypes.func,
  toggleCheckJson: PropTypes.func
};

export default Checklist;
