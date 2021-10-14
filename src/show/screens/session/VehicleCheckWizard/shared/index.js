import React from 'react';

import I18n from 'Locales/I18n';
import { defaults } from 'Theme';
import Alert from 'Services/alert';
import { ColumnView } from 'Containers';
import { ProgressBar } from 'Components';

export const renderProgressBar = (current, payload) => (
  <ColumnView
    width={'auto'}
    height={4}
    marginHorizontal={defaults.marginHorizontal}>
    <ProgressBar
      height={4}
      progress={current}
      total={payload.shiftStart ? 5 : 4}
    />
  </ColumnView>
);

export const triggerDriverAlert = ({
  mandatoryPrompts,
  promptIndex,
  saveVehicleChecks,
  showMustComplyWithTerms
}) => {
  Alert({
    title: mandatoryPrompts[promptIndex].title,
    message: mandatoryPrompts[promptIndex].message,
    buttons: [
      {
        text: I18n.t('general:no'),
        style: 'cancel',
        onPress: showMustComplyWithTerms
      },
      {
        text: I18n.t('general:yes'),
        onPress:
          promptIndex === mandatoryPrompts.length - 1
            ? saveVehicleChecks.bind(null, 'shiftStartVanChecks')
            : triggerDriverAlert.bind(null, {
                mandatoryPrompts,
                promptIndex: promptIndex + 1,
                saveVehicleChecks,
                showMustComplyWithTerms
              })
      }
    ],
    options: { cancelable: false }
  });
};

export const triggerDriverConfirmations = ({
  saveVehicleChecks,
  showMustComplyWithTerms
}) => {
  const mandatoryPrompts = [
    {
      title: I18n.t('screens:checklist.driverPrompts.title'),
      message: I18n.t('screens:checklist.driverPrompts.messages.fit')
    },
    {
      title: I18n.t('screens:checklist.driverPrompts.title'),
      message: I18n.t('screens:checklist.driverPrompts.messages.license')
    }
  ];
  triggerDriverAlert({
    mandatoryPrompts,
    promptIndex: 0,
    saveVehicleChecks,
    showMustComplyWithTerms
  });
};
