import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Pressable } from 'react-native';

import I18n from 'Locales/I18n';
import { defaults } from 'Theme';
import { deviceFrame, mock } from 'Helpers';
import NavigationService from 'Services/navigation';
import { ColumnView, Modal, RowView, SafeAreaView, useTheme } from 'Containers';
import {
  Button,
  ListHeader,
  NavBar,
  Text,
  TextInput,
  Separator
} from 'Components';

import { renderProgressBar } from '../shared';

const mileageReference = React.createRef();
const focusMileage = () => {
  mileageReference?.current?.focus();
};
const { width } = deviceFrame();

const handleNextAction = (
  navigation,
  vehicleRegistrationOnFile,
  setVisible
) => {
  if (vehicleRegistrationOnFile) {
    navigation();
  } else {
    setVisible(true);
  }
};

const handleYesAction = (setVisible, navigation) => {
  setVisible(false);
  navigation();
};

const handleGoBack = (setVisible, setSecondAttempt) => {
  setVisible(false);
  setSecondAttempt(true);
};

const updateReducerAndTransient = (
  { updateTransientProps, reducerMethod, prop },
  value
) => {
  const update = {};
  update[`${prop}`] = value;
  updateTransientProps(update);
  reducerMethod(value);
};

const handleRegistration = (
  updateTransientProps,
  setValidNumberPlate,
  registrationPlates,
  setRegistration,
  registration
) => {
  updateReducerAndTransient(
    {
      updateTransientProps,
      reducerMethod: setRegistration,
      prop: 'vehicleRegistration'
    },
    registration
  );

  updateReducerAndTransient(
    {
      updateTransientProps,
      reducerMethod: setValidNumberPlate,
      prop: 'registrationCheckOverride'
    },

    registrationPlates?.filter(
      reg => reg.registration === registration?.replace(/ /g, '')
    ).length <= 0
  );
};

const RegistrationMileage = ({
  currentMileage,
  currentMileageErrorMessage,
  currentMileageHasError,
  navigation,
  payload,
  registrationPlates,
  setMileage,
  setRegistration,
  setValidNumberPlate,
  updateTransientProps,
  vehicleRegistration,
  vehicleRegistrationErrorMessage,
  vehicleRegistrationHasError
}) => {
  const { colors } = useTheme();

  const {
    currentMileage: payloadCurrentMileage,
    vehicleRegistration: payloadVehicleRegistration
  } = payload;
  const [visible, setVisible] = useState(false);
  const [secondAttempt, setSecondAttempt] = useState(false);
  const routeName = 'EmptiesCollected';
  const disabled = currentMileageHasError || vehicleRegistrationHasError;

  const vehicleRegistrationOnFile =
    registrationPlates?.filter(
      reg => reg.registration === vehicleRegistration?.replace(/ /g, '')
    ).length > 0;

  useEffect(() => {
    const focusListener = navigation.addListener(
      'focus',
      updateTransientProps.bind(null, {
        currentMileage: payloadCurrentMileage,
        vehicleRegistration: payloadVehicleRegistration
      })
    );

    return focusListener;
  });

  return (
    <SafeAreaView>
      <Modal visible={visible} transparent={true} animationType={'fade'}>
        <ColumnView
          marginHorizontal={defaults.marginHorizontal}
          width={width - defaults.marginHorizontal * 2}
          flex={1}>
          <ColumnView
            alignItems={'flex-start'}
            borderColor={colors.input}
            borderWidth={1}
            backgroundColor={colors.neutral}
            overflow={'hidden'}
            borderRadius={defaults.borderRadius}>
            <ColumnView paddingHorizontal={defaults.marginHorizontal}>
              <RowView
                justifyContent={'flex-start'}
                marginTop={defaults.marginVertical}
                marginBottom={defaults.marginVertical / 2}>
                <Text.Heading align={'left'} color={colors.inputSecondary}>
                  {I18n.t('screens:registrationMileage.modal.title')}
                </Text.Heading>
              </RowView>
            </ColumnView>

            <Separator width={'100%'} />
            <ColumnView
              paddingHorizontal={defaults.marginHorizontal}
              paddingVertical={defaults.marginVertical}>
              <Text.List width={'100%'} color={colors.inputSecondary}>
                {I18n.t('screens:registrationMileage.modal.body')}
              </Text.List>
            </ColumnView>

            {secondAttempt && (
              <ColumnView
                marginBottom={defaults.marginVertical}
                paddingHorizontal={defaults.marginHorizontal}>
                <Pressable
                  onPress={handleYesAction.bind(
                    null,
                    setVisible,
                    NavigationService.navigate.bind(null, {
                      routeName
                    })
                  )}>
                  <Text.List color="white" underline>
                    {I18n.t('screens:registrationMileage.modal.proceedAnyway')}
                  </Text.List>
                </Pressable>
              </ColumnView>
            )}

            <Button.Primary
              title={I18n.t('general:tryAgain')}
              onPress={handleGoBack.bind(null, setVisible, setSecondAttempt)}
              noBorderRadius
            />
          </ColumnView>
        </ColumnView>
      </Modal>

      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}
        alignItems={'stretch'}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          title={I18n.t('screens:registrationMileage.title')}
          rightText={I18n.t('general:next')}
          rightAction={handleNextAction.bind(
            null,
            NavigationService.navigate.bind(null, {
              routeName
            }),
            vehicleRegistrationOnFile,
            setVisible
          )}
          rightActionDisabled={disabled}
          {...(disabled && { rightColor: colors.inputSecondary })}
          testID={'checkVan-navbar'}
        />
        {renderProgressBar(1, payload)}

        <ColumnView scrollable width={'auto'} alignItems={'stretch'}>
          <KeyboardAvoidingView behavior={'padding'}>
            <ListHeader
              title={I18n.t('screens:registrationMileage.registration')}
            />

            <RowView
              width={'auto'}
              marginHorizontal={defaults.marginHorizontal}
              marginVertical={defaults.marginVertical / 2}>
              <TextInput
                autoCapitalize={'characters'}
                error={
                  vehicleRegistrationHasError || !vehicleRegistrationOnFile
                }
                errorMessage={
                  vehicleRegistrationErrorMessage ||
                  I18n.t('screens:registrationMileage.invalidPlate')
                }
                onChangeText={handleRegistration.bind(
                  null,
                  updateTransientProps,
                  setValidNumberPlate,
                  registrationPlates,
                  setRegistration
                )}
                onSubmitEditing={focusMileage}
                placeholder={I18n.t('input:placeholder.registration')}
                value={vehicleRegistration}
                returnKeyType={'next'}
                testID={'checkVan-registration-input'}
              />
            </RowView>

            <ListHeader title={I18n.t('screens:registrationMileage.mileage')} />

            <RowView
              width={'auto'}
              marginHorizontal={defaults.marginHorizontal}
              marginVertical={defaults.marginVertical / 2}>
              <TextInput
                autoCapitalize={'none'}
                error={currentMileageHasError}
                errorMessage={currentMileageErrorMessage}
                disableOnSubmitEditing={disabled}
                keyboardType={'number-pad'}
                onChangeText={updateReducerAndTransient.bind(null, {
                  updateTransientProps,
                  reducerMethod: setMileage,
                  prop: 'currentMileage'
                })}
                onSubmitEditing={handleNextAction.bind(
                  null,
                  NavigationService.navigate.bind(null, {
                    routeName
                  }),
                  vehicleRegistrationOnFile,
                  setVisible
                )}
                placeholder={I18n.t('input:placeholder.mileage')}
                ref={mileageReference}
                returnKeyType={'done'}
                testID={'checkVan-mileage-input'}
                value={currentMileage}
              />
            </RowView>
          </KeyboardAvoidingView>
        </ColumnView>

        <RowView
          width={'auto'}
          paddingHorizontal={defaults.marginHorizontal}
          marginBottom={defaults.marginVertical}>
          <Button.Primary
            onPress={handleNextAction.bind(
              null,
              NavigationService.navigate.bind(null, {
                routeName
              }),
              vehicleRegistrationOnFile,
              setVisible
            )}
            title={I18n.t('general:next')}
            disabled={disabled}
            testID={'checkVan-next-btn'}
          />
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

RegistrationMileage.defaults = {
  currentMileage: '',
  currentMileageErrorMessage: '',
  currentMileageHasError: false,
  navigation: {},
  payload: {},
  registrationPlates: [],
  setValidNumberPlate: mock,
  setMileage: mock,
  setRegistration: mock,
  updateTransientProps: mock,
  vehicleRegistration: '',
  vehicleRegistrationErrorMessage: '',
  vehicleRegistrationHasError: false
};
RegistrationMileage.propTypes = {
  currentMileage: PropTypes.string,
  currentMileageErrorMessage: PropTypes.string,
  currentMileageHasError: PropTypes.bool,
  navigation: PropTypes.object,
  payload: PropTypes.object,
  registrationPlates: PropTypes.array,
  setValidNumberPlate: PropTypes.func,
  setMileage: PropTypes.func,
  setRegistration: PropTypes.func,
  updateTransientProps: PropTypes.func,
  vehicleRegistration: PropTypes.string,
  vehicleRegistrationErrorMessage: PropTypes.string,
  vehicleRegistrationHasError: PropTypes.bool
};

export default RegistrationMileage;
