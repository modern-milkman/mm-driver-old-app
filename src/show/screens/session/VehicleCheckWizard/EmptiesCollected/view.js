import React from 'react';
import PropTypes from 'prop-types';
import { NavigationEvents } from 'react-navigation';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { defaults, colors } from 'Theme';
import NavigationService from 'Navigation/service';
import { ColumnView, SafeAreaView, RowView } from 'Containers';
import { Button, ListHeader, NavBar, TextInput } from 'Components';

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
  update[`${description}Bottles`] = value;
  updateTransientProps(update);
  setEmpty(id, value);
};

const renderEmpty = (
  { disabled, length, updateTransientProps, setEmpty, ...empties },
  { id, description },
  index
) => (
  <>
    <ListHeader
      title={I18n.t(`screens:emptiesCollected.elements.${description}`)}
    />

    <RowView
      width={'auto'}
      marginHorizontal={defaults.marginHorizontal}
      marginTop={defaults.marginVertical / 2}>
      <TextInput
        keyboardType={'numeric'}
        error={empties[`${description}BottlesHasError`]}
        errorMessage={empties[`${description}BottlesErrorMessage`]}
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
        value={empties[`${description}Bottles`]}
        ref={emptiesReference[index]}
        returnKeyType={'next'}
      />
    </RowView>
  </>
);

const updateTransientEmpties = ({ emptiesCollected, updateTransientProps }) => {
  const update = {};
  for (const { description, value } of Object.values(emptiesCollected)) {
    update[`${description}Bottles`] = value;
  }
  updateTransientProps(update);
};

const EmptiesCollected = ({
  payload,
  setEmpty,
  updateTransientProps,
  ...empties
}) => {
  const { emptiesCollected } = payload;
  let disabled = false;
  const emptiesArray = Object.values(emptiesCollected);
  for (const { description, value } of emptiesArray) {
    if (!value || empties[`${description}BottlesHasError`]) {
      disabled = true;
    }
    emptiesReference.push(React.createRef());
  }

  return (
    <SafeAreaView top bottom>
      <NavigationEvents
        onWillFocus={updateTransientEmpties.bind(null, {
          emptiesCollected: payload.emptiesCollected,
          updateTransientProps
        })}
      />
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
        />
        {renderProgressBar(2, payload)}

        <ColumnView scrollable width={'auto'} alignItems={'stretch'}>
          {emptiesArray.map(
            renderEmpty.bind(null, {
              disabled,
              length: emptiesArray.length,
              updateTransientProps,
              setEmpty,
              ...empties
            })
          )}
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
          />
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

EmptiesCollected.propTypes = {
  payload: PropTypes.object,
  setEmpty: PropTypes.func,
  updateTransientProps: PropTypes.func
};

export default EmptiesCollected;
