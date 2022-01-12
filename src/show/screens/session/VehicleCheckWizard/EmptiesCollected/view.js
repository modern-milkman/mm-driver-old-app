import PropTypes from 'prop-types';
import { KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect } from 'react';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { defaults, colors } from 'Theme';
import NavigationService from 'Services/navigation';
import { ColumnView, SafeAreaView, RowView } from 'Containers';
import { Button, ListHeader, NavBar, Text, TextInput } from 'Components';

import { renderProgressBar } from '../shared';

const emptiesReference = [];

const focusNext = index => {
  emptiesReference[index + 1]?.current?.focus();
};

const updateEmpty = (
  { description, id, setEmpty, updateTransientProps },
  value
) => {
  const update = {};
  update[`empty${id}`] = value;
  updateTransientProps(update);
  setEmpty(id, value);
};

const renderEmpty = (
  { disabled, length, updateTransientProps, setEmpty, ...empties },
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
          description,
          id,
          setEmpty,
          updateTransientProps
        })}
        onSubmitEditing={
          index === length - 1
            ? disabled
              ? mock
              : NavigationService.navigate.bind(null, {
                routeName: 'DamageReport'
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
  setEmpty,
  updateTransientProps,
  ...empties
}) => {
  const { emptiesCollected } = payload;
  let disabled = false;
  const emptiesArray = Object.values(emptiesCollected);
  for (const { id, value } of emptiesArray) {
    if (!value || empties[`empty${id}HasError`]) {
      disabled = true;
    }
    emptiesReference.push(React.createRef());
  }

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
          title={I18n.t('screens:emptiesCollected.title')}
          rightText={I18n.t('general:next')}
          rightAction={
            disabled
              ? mock
              : NavigationService.navigate.bind(null, {
                routeName: 'DamageReport'
              })
          }
          {...(disabled && { rightColor: colors.inputDark })}
          testID="empties-navbar"
        />
        {renderProgressBar(2, payload)}

        <ColumnView scrollable width={'auto'} alignItems={'stretch'}>
          <RowView
            width={'auto'}
            marginTop={defaults.marginVertical / 2}
            marginHorizontal={defaults.marginHorizontal}>
            <Text.Caption align={'left'} flex={1} color={colors.secondary}>
              {I18n.t(
                `screens:emptiesCollected.subHeading.${payload.shiftStart ? 'start' : 'end'
                }`
              )}
            </Text.Caption>
          </RowView>
          <KeyboardAvoidingView behavior={'padding'}>
            {emptiesArray.map(
              renderEmpty.bind(null, {
                disabled,
                length: emptiesArray.length,
                updateTransientProps,
                setEmpty,
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
            onPress={NavigationService.navigate.bind(null, {
              routeName: 'DamageReport'
            })}
            title={I18n.t('general:next')}
            disabled={disabled}
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
  setEmpty: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default EmptiesCollected;
