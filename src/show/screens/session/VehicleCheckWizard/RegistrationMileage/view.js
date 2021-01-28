import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import React, { useState, useRef } from 'react';
import NavigationService from 'Navigation/service';
import { Platform, Pressable } from 'react-native';

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

const RegistrationMileage = ({ payload, setMileage, setRegistration }) => {
  const { currentMileage, vehicleRegistration } = payload;
  const camera = useRef();
  const [plateImage, setPlateImage] = useState('');

  const disabled =
    currentMileage?.length === 0 || vehicleRegistration?.length === 0;

  const setNrPlateAndStop = async (plate) => {
    const data = await camera.current.takePictureAsync({
      quality: 1
    });

    setPlateImage(data.uri);
    setRegistration(plate);
  };

  const smartUKFilter = async (blocks) => {
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
                  routeName: 'DamageReport'
                })
          }
          {...(disabled && { rightColor: colors.inputDark })}
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
              onChangeText={setRegistration.bind(null)}
              onSubmitEditing={focusMileage}
              placeholder={I18n.t('input:placeholder.registration')}
              value={vehicleRegistration}
              disableErrors
              returnKeyType={'next'}
            />
          </RowView>

          <ListHeader title={I18n.t('screens:registrationMileage.mileage')} />

          <RowView
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}
            marginVertical={defaults.marginVertical / 2}>
            <TextInput
              autoCapitalize={'none'}
              onChangeText={setMileage.bind(null)}
              onSubmitEditing={
                disabled
                  ? mock
                  : NavigationService.navigate.bind(null, {
                      routeName: 'DamageReport'
                    })
              }
              placeholder={I18n.t('input:placeholder.mileage')}
              value={currentMileage}
              disableErrors
              ref={mileageReference}
              returnKeyType={'next'}
            />
          </RowView>
        </ColumnView>

        <RowView width={'auto'} paddingHorizontal={defaults.marginHorizontal}>
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

RegistrationMileage.propTypes = {
  payload: PropTypes.object,
  setMileage: PropTypes.func,
  setRegistration: PropTypes.func
};

export default RegistrationMileage;
