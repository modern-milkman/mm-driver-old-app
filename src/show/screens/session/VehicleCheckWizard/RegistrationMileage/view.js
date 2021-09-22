import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import React, { useState, useRef } from 'react';
import NavigationService from 'Navigation/service';
import { Platform, Pressable } from 'react-native';
import { NavigationEvents } from 'react-navigation';

import I18n from 'Locales/I18n';
import { defaults, colors } from 'Theme';
import { deviceFrame, mock, plateRecognition } from 'Helpers';
import { ColumnView, SafeAreaView, RowView } from 'Containers';
import { Button, ListHeader, NavBar, Text, TextInput, Image } from 'Components';

import styles from './style';
import plates from './plates';
import { renderProgressBar } from '../shared';

const { width } = deviceFrame();
const videowidth = width - defaults.marginHorizontal * 2;
const mileageReference = React.createRef();
const focusMileage = () => {
  mileageReference?.current?.focus();
};

const UKregex = RegExp(
  '(^[A-Z]{2}[0-9]{2}s?[A-Z]{3}$)|(^[A-Z][0-9]{1,3}[A-Z]{3}$)|(^[A-Z]{3}[0-9]{1,3}[A-Z]$)|(^[0-9]{1,4}[A-Z]{1,2}$)|(^[0-9]{1,3}[A-Z]{1,3}$)|(^[A-Z]{1,2}[0-9]{1,4}$)|(^[A-Z]{1,3}[0-9]{1,3}$)|(^[A-Z]{1,3}[0-9]{1,4}$)|(^[0-9]{3}[DX]{1}[0-9]{3}$)'
);

const updateReducerAndTransient = (
  { updateTransientProps, reducerMethod, prop },
  value
) => {
  const update = {};
  update[`${prop}`] = value;
  updateTransientProps(update);
  reducerMethod(value);
};

const RegistrationMileage = ({
  currentMileage,
  currentMileageErrorMessage,
  currentMileageHasError,
  payload,
  setMileage,
  setRegistration,
  updateTransientProps,
  vehicleRegistration,
  vehicleRegistrationErrorMessage,
  vehicleRegistrationHasError
}) => {
  const {
    currentMileage: payloadCurrentMileage,
    vehicleRegistration: payloadVehicleRegistration
  } = payload;
  const camera = useRef();
  const [plateImage, setPlateImage] = useState('');
  const nextRouteName = payload.shiftStart
    ? 'EmptiesCollected'
    : 'DamageReport';

  const disabled = currentMileageHasError || vehicleRegistrationHasError;

  const setNrPlateAndStop = async plate => {
    const data = await camera.current.takePictureAsync({
      quality: 1
    });

    setPlateImage(data.uri);
    setRegistration(plate);
  };

  const smartUKFilter = async blocks => {
    if (blocks.textBlocks.length === 0) {
      return;
    }

    for (const text of blocks.textBlocks) {
      let plateWithoutSpace = text.value.replace(/\s/g, '');
      if (typeof text.value === 'string' && UKregex.test(plateWithoutSpace)) {
        const plateRec = plateRecognition(text.value, plates);
        if (plateRec.length > 0) {
          setNrPlateAndStop(plateRec);
          focusMileage();
        } else {
          setNrPlateAndStop(text.value);
        }
      }
    }
  };

  return (
    <SafeAreaView top bottom>
      <NavigationEvents
        onWillFocus={updateTransientProps.bind(null, {
          currentMileage: payloadCurrentMileage,
          vehicleRegistration: payloadVehicleRegistration
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
          title={I18n.t('screens:registrationMileage.title')}
          rightText={I18n.t('general:next')}
          rightAction={
            disabled
              ? mock
              : NavigationService.navigate.bind(null, {
                  routeName: nextRouteName
                })
          }
          {...(disabled && { rightColor: colors.inputDark })}
          testID={'checkVan-navbar'}
        />
        {renderProgressBar(1, payload)}

        <ColumnView scrollable width={'auto'} alignItems={'stretch'}>
          <ListHeader
            title={I18n.t('screens:registrationMileage.registration')}
          />

          <ColumnView
            width={videowidth}
            height={videowidth * (4 / 3)}
            backgroundColor={colors.primary}
            overflow={'hidden'}
            borderRadius={defaults.borderRadius}
            marginHorizontal={defaults.marginHorizontal}
            marginVertical={defaults.marginVertical / 2}>
            <Pressable
              onPress={setPlateImage.bind(null, '')}
              style={styles.preview}>
              {plateImage.length > 0 ? (
                <Image
                  style={styles.preview}
                  blurRadius={Platform.select({
                    android: 4,
                    ios: 120
                  })}
                  source={{
                    uri: plateImage
                  }}
                />
              ) : (
                <RNCamera
                  pictureSize={'640x480'}
                  quality={RNCamera.Constants.VideoQuality['4:3']}
                  ratio={'4:3'}
                  ref={camera}
                  style={styles.preview}
                  type={RNCamera.Constants.Type.back}
                  onTextRecognized={smartUKFilter}
                  captureAudio={false}
                />
              )}
            </Pressable>
          </ColumnView>

          <Text.Label color={colors.inputDark} align={'center'}>
            {I18n.t('screens:registrationMileage.or')}
          </Text.Label>

          <RowView
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}
            marginVertical={defaults.marginVertical / 2}>
            <TextInput
              autoCapitalize={'none'}
              error={vehicleRegistrationHasError}
              errorMessage={vehicleRegistrationErrorMessage}
              onChangeText={updateReducerAndTransient.bind(null, {
                updateTransientProps,
                reducerMethod: setRegistration,
                prop: 'vehicleRegistration'
              })}
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
              keyboardType={'numeric'}
              error={currentMileageHasError}
              errorMessage={currentMileageErrorMessage}
              autoCapitalize={'none'}
              onChangeText={updateReducerAndTransient.bind(null, {
                updateTransientProps,
                reducerMethod: setMileage,
                prop: 'currentMileage'
              })}
              onSubmitEditing={
                disabled
                  ? mock
                  : NavigationService.navigate.bind(null, {
                      routeName: nextRouteName
                    })
              }
              placeholder={I18n.t('input:placeholder.mileage')}
              value={currentMileage}
              ref={mileageReference}
              returnKeyType={'next'}
              testID={'checkVan-mileage-input'}
            />
          </RowView>
        </ColumnView>

        <RowView
          width={'auto'}
          paddingHorizontal={defaults.marginHorizontal}
          marginBottom={defaults.marginVertical}>
          <Button.Primary
            onPress={NavigationService.navigate.bind(null, {
              routeName: nextRouteName
            })}
            title={I18n.t('general:next')}
            disabled={disabled}
            testID={'checkVan-next-btn'}
          />
        </RowView>
      </ColumnView>
    </SafeAreaView>
  );
};

RegistrationMileage.propTypes = {
  currentMileage: PropTypes.string,
  currentMileageErrorMessage: PropTypes.string,
  currentMileageHasError: PropTypes.bool,
  payload: PropTypes.object,
  setMileage: PropTypes.func,
  setRegistration: PropTypes.func,
  updateTransientProps: PropTypes.func,
  vehicleRegistration: PropTypes.string,
  vehicleRegistrationErrorMessage: PropTypes.string,
  vehicleRegistrationHasError: PropTypes.bool
};

export default RegistrationMileage;
