import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { defaults } from 'Theme';
import NavigationService from 'Services/navigation';
import { ColumnView, SafeAreaView, RowView, useTheme } from 'Containers';
import { Button, ListHeader, NavBar, Text, TextInput } from 'Components';

import { renderProgressBar, triggerDriverConfirmations } from '../shared';

const emptiesReference = [];

const focusNext = index => {
  emptiesReference[index + 1]?.current?.focus();
};
const nextStep = ({ payload, saveVehicleChecks, showMustComplyWithTerms }) => {
  if (payload.shiftStart) {
    triggerDriverConfirmations({ saveVehicleChecks, showMustComplyWithTerms });
  } else {
    saveVehicleChecks('shiftEndVanChecks');
  }
};

const updateEmpty = ({ id, setEmpty, updateTransientProps }, value) => {
  const update = {};
  update[`empty${id}`] = value;
  updateTransientProps(update);
  setEmpty(id, value);
};

const renderEmpty = (
  {
    disabled,
    length,
    payload,
    saveVehicleChecks,
    setEmpty,
    showMustComplyWithTerms,
    updateTransientProps,
    ...empties
  },
  { id, description },
  index
) => (
  <>
    <ListHeader title={description} />

    <RowView
      width={'auto'}
      marginHorizontal={defaults.marginHorizontal}
      marginTop={defaults.marginVertical / 2}>
      <TextInput
        keyboardType={'numeric'}
        error={empties[`empty${id}HasError`]}
        errorMessage={empties[`empty${id}ErrorMessage`]}
        autoCapitalize={'none'}
        onChangeText={updateEmpty.bind(null, {
          id,
          setEmpty,
          updateTransientProps
        })}
        onSubmitEditing={
          index === length - 1
            ? disabled
              ? mock
              : nextStep.bind(null, {
                  payload,
                  saveVehicleChecks,
                  showMustComplyWithTerms
                })
            : focusNext.bind(null, index)
        }
        placeholder={I18n.t('input:placeholder.number')}
        value={empties[`empty${id}`]}
        ref={emptiesReference[index]}
        returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
        testID={`empties-textInput-${id}`}
      />
    </RowView>
  </>
);

const updateTransientEmpties = ({ emptiesCollected, updateTransientProps }) => {
  const update = {};
  for (const { id, value } of Object.values(emptiesCollected)) {
    update[`empty${id}`] = value;
  }
  updateTransientProps(update);
};

const EmptiesCollected = ({
  navigation,
  payload,
  saveVehicleChecks,
  setEmpty,
  processing,
  showMustComplyWithTerms,
  updateTransientProps,
  ...empties
}) => {
  const { colors } = useTheme();
  const { emptiesCollected } = payload;
  let disabled = false;
  const emptiesArray = Object.values(emptiesCollected);
  for (const { id, value } of emptiesArray) {
    if (!value || empties[`empty${id}HasError`]) {
      disabled = true;
    }
    emptiesReference.push(React.createRef());
  }

  const mainActionTitle = payload.shiftStart
    ? I18n.t('general:next')
    : I18n.t('general:done');

  useEffect(() => {
    const focusListener = navigation.addListener(
      'focus',
      updateTransientEmpties.bind(null, {
        emptiesCollected: payload.emptiesCollected,
        updateTransientProps
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
                  saveVehicleChecks,
                  showMustComplyWithTerms
                })
          }
          {...(disabled && { rightColor: colors.inputSecondary })}
          testID="empties-navbar"
        />
        {renderProgressBar(2, payload)}

        <ColumnView scrollable width={'auto'} alignItems={'stretch'}>
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
                length: emptiesArray.length,
                payload,
                saveVehicleChecks,
                setEmpty,
                showMustComplyWithTerms,
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
              saveVehicleChecks,
              showMustComplyWithTerms
            })}
            testID="empties-mainNext-btn"
          />
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

EmptiesCollected.propTypes = {
  navigation: PropTypes.object,
  payload: PropTypes.object,
  processing: PropTypes.bool,
  saveVehicleChecks: PropTypes.func,
  setEmpty: PropTypes.func,
  showMustComplyWithTerms: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default EmptiesCollected;
