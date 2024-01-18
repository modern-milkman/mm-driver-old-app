import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { defaults } from 'Theme';
import { openRateMyRound } from 'SessionShared';
import NavigationService from 'Services/navigation';
import { ColumnView, SafeAreaView, RowView, useTheme } from 'Containers';
import { Button, ListHeader, NavBar, Text, TextInput } from 'Components';

import { renderProgressBar, triggerDriverConfirmations } from '../shared';

const emptiesReference = [];

const focusNext = index => {
  emptiesReference[index + 1]?.current?.focus();
};

const nextStep = ({
  payload,
  rateMyRound,
  saveVehicleChecks,
  showMustComplyWithTerms,
  updateChecklistProps,
  updateInAppBrowserProps
}) => {
  if (payload.shiftStart) {
    triggerDriverConfirmations({ saveVehicleChecks, showMustComplyWithTerms });
  } else {
    saveVehicleChecks('shiftEndVanChecks');

    if (!rateMyRound) {
      openRateMyRound({
        updateChecklistProps,
        updateInAppBrowserProps
      });
    }
  }
};

const updateEmpty = (
  { id, setEmpty, updateTransientProps, emptiesRequired },
  value
) => {
  const update = {};
  update[`${emptiesRequired ? 'requiredEmpty' : 'empty'}${id}`] = value;
  updateTransientProps(update);
  setEmpty(id, value);
};

const renderEmpty = (
  {
    disabled,
    emptiesRequired,
    emptiesScreenDirty,
    length,
    payload,
    rateMyRound,
    saveVehicleChecks,
    setEmpty,
    showMustComplyWithTerms,
    updateChecklistProps,
    updateInAppBrowserProps,
    updateTransientProps,
    ...empties
  },
  { id, description },
  index
) => {
  return (
    <>
      <ListHeader title={description} />

      <RowView
        width={'auto'}
        marginHorizontal={defaults.marginHorizontal}
        marginTop={defaults.marginVertical / 2}>
        <TextInput
          keyboardType={'numeric'}
          error={
            empties[
              `${emptiesRequired ? 'requiredEmpty' : 'empty'}${id}HasError`
            ]
          }
          errorMessage={
            empties[
              `${emptiesRequired ? 'requiredEmpty' : 'empty'}${id}ErrorMessage`
            ]
          }
          autoCapitalize={'none'}
          onChangeText={updateEmpty.bind(null, {
            id,
            setEmpty,
            updateTransientProps,
            emptiesRequired
          })}
          onSubmitEditing={
            index === length - 1
              ? disabled
                ? mock
                : nextStep.bind(null, {
                    payload,
                    rateMyRound,
                    saveVehicleChecks,
                    showMustComplyWithTerms,
                    updateChecklistProps,
                    updateInAppBrowserProps
                  })
              : focusNext.bind(null, index)
          }
          placeholder={I18n.t('input:placeholder.number')}
          value={empties[`${emptiesRequired ? 'requiredEmpty' : 'empty'}${id}`]}
          ref={emptiesReference[index]}
          returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
          testID={`empties-textInput-${index}`}
        />
      </RowView>
    </>
  );
};

const updateTransientEmpties = ({
  emptiesCollected,
  updateTransientProps,
  emptiesRequired
}) => {
  const update = {};
  for (const { id, value } of Object.values(emptiesCollected)) {
    update[`${emptiesRequired ? 'requiredEmpty' : 'empty'}${id}`] = value;
  }
  updateTransientProps(update);
};

const EmptiesCollected = ({
  emptiesRequired,
  emptiesScreenDirty,
  navigation,
  payload,
  rateMyRound,
  saveVehicleChecks,
  setEmpty,
  processing,
  showMustComplyWithTerms,
  updateChecklistProps,
  updateInAppBrowserProps,
  updateTransientProps,
  ...empties
}) => {
  const { colors } = useTheme();
  const { emptiesCollected } = payload;
  let disabled = false;
  const emptiesArray = Object.values(emptiesCollected);

  for (const { id } of emptiesArray) {
    if (
      empties[`${emptiesRequired ? 'requiredEmpty' : 'empty'}${id}HasError`]
    ) {
      disabled = true;
    }

    emptiesReference.push(React.createRef());
  }

  const mainActionTitle = payload.shiftStart
    ? emptiesScreenDirty
      ? I18n.t('general:next')
      : I18n.t('general:skip')
    : I18n.t('general:done');

  useEffect(() => {
    const focusListener = navigation.addListener(
      'focus',
      updateTransientEmpties.bind(null, {
        emptiesCollected: payload.emptiesCollected,
        updateTransientProps,
        emptiesRequired
      })
    );

    return focusListener;
  });

  return (
    <SafeAreaView>
      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}
        alignItems={'stretch'}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          {...(processing && { leftIconColor: colors.inputSecondary })}
          title={I18n.t('screens:emptiesCollected.title')}
          rightText={payload.shiftStart && !processing ? mainActionTitle : null}
          rightAction={
            disabled || processing
              ? mock
              : nextStep.bind(null, {
                  payload,
                  rateMyRound,
                  saveVehicleChecks,
                  showMustComplyWithTerms,
                  updateChecklistProps,
                  updateInAppBrowserProps
                })
          }
          {...(disabled && {
            rightColor: colors.input
          })}
          testID="empties-navbar"
        />
        {renderProgressBar(2, payload)}

        <ColumnView
          scrollable
          width={'auto'}
          alignItems={'stretch'}
          testID={'empties-scroll-view'}>
          <RowView
            width={'auto'}
            marginTop={defaults.marginVertical / 2}
            marginHorizontal={defaults.marginHorizontal}>
            <Text.Caption align={'left'} flex={1} color={colors.inputSecondary}>
              {I18n.t(
                `screens:emptiesCollected.subHeading.${
                  payload.shiftStart ? 'start' : 'end'
                }`
              )}
            </Text.Caption>
          </RowView>
          <KeyboardAvoidingView behavior={'padding'}>
            {emptiesArray.map(
              renderEmpty.bind(null, {
                disabled,
                emptiesRequired,
                length: emptiesArray.length,
                payload,
                rateMyRound,
                saveVehicleChecks,
                setEmpty,
                showMustComplyWithTerms,
                updateChecklistProps,
                updateInAppBrowserProps,
                updateTransientProps,
                ...empties
              })
            )}
          </KeyboardAvoidingView>
        </ColumnView>

        <RowView
          width={'auto'}
          paddingHorizontal={defaults.marginHorizontal}
          marginBottom={defaults.marginVertical}>
          <Button.Primary
            title={mainActionTitle}
            disabled={disabled || processing}
            processing={processing}
            onPress={nextStep.bind(null, {
              payload,
              rateMyRound,
              saveVehicleChecks,
              showMustComplyWithTerms,
              updateChecklistProps,
              updateInAppBrowserProps
            })}
            testID="empties-mainNext-btn"
          />
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

EmptiesCollected.propTypes = {
  emptiesRequired: PropTypes.bool,
  emptiesScreenDirty: PropTypes.bool,
  navigation: PropTypes.object,
  payload: PropTypes.object,
  rateMyRound: PropTypes.bool,
  processing: PropTypes.bool,
  saveVehicleChecks: PropTypes.func,
  setEmpty: PropTypes.func,
  showMustComplyWithTerms: PropTypes.func,
  updateChecklistProps: PropTypes.func,
  updateInAppBrowserProps: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default EmptiesCollected;
