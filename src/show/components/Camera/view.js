import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { Camera as RNCamera, FlashMode } from 'expo-camera';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { defaults, sizes } from 'Theme';
import { deviceFrame, mock } from 'Helpers';
import { Button, Icon, Image, TextInput } from 'Components';
import {
  ColumnView,
  RowView,
  SafeAreaView,
  useTheme,
  useThemedStyles
} from 'Containers';

import unthemedStyle from './style';

const { width, height } = deviceFrame();
const minSquare = Math.min(width, height);

const handleCapture = async ({ cameraRef, setCurrentPhoto }) => {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.5
    });

    setCurrentPhoto({ mime: 'image/jpeg', uri: photo.uri });
  }
};

const handleOnSave = ({ data, onClosePress, onSave }) => {
  onClosePress();
  onSave(data);
};

const handleBarcodeScanned = ({ onClosePress, onSave }, { data }) => {
  onClosePress();
  onSave(data);
};

const FlashModes = [
  { type: FlashMode.torch, icon: 'flashlight' },
  { type: FlashMode.on, icon: 'flash' },
  { type: FlashMode.auto, icon: 'flash-auto' },
  { type: FlashMode.off, icon: 'flash-off' }
];

const toggleTorch = ({ flashModeIndex = 0, updateProps = mock }) => {
  const nextFlashModeIndex = (flashModeIndex + 1) % FlashModes.length;
  updateProps({ flashModeIndex: nextFlashModeIndex });
};

const Camera = props => {
  const {
    buttonAccessibility = sizes.button.large,
    flashModeIndex = 0,
    onClosePress = mock,
    onSave = mock,
    showBarCodeScanner = false,
    showRegularControls = true,
    squareImage = false,
    updateProps = mock
  } = props;

  const { colors, alphaColor } = useTheme();
  const style = useThemedStyles(unthemedStyle);

  const cameraRef = useRef(null);
  const [currentPhoto, setCurrentPhoto] = useState({});
  const [barcodeValue, setBarcodeValue] = useState('');

  return (
    <View style={{ ...style.flex, ...style.opaque }}>
      <SafeAreaView style={style.cameraScannerOverlay}>
        <KeyboardAvoidingView behavior={'height'} style={style.flex}>
          <ColumnView
            marginHorizontal={defaults.marginHorizontal}
            width={width - defaults.marginHorizontal * 2}
            flex={1}
            justifyContent={'space-between'}
            marginBottom={defaults.marginVertical}>
            <RowView
              justifyContent={
                !currentPhoto?.uri ? 'space-between' : 'flex-end'
              }>
              {!currentPhoto?.uri && (
                <Icon
                  name={FlashModes[flashModeIndex].icon}
                  color={colors.inputSecondary}
                  size={40}
                  containerSize={buttonAccessibility}
                  onPress={toggleTorch.bind(null, {
                    flashModeIndex,
                    updateProps
                  })}
                />
              )}
              <CustomIcon
                onPress={onClosePress}
                containerWidth={buttonAccessibility}
                width={buttonAccessibility}
                icon={'close'}
                iconColor={colors.primary}
              />
            </RowView>
            {showBarCodeScanner && (
              <ColumnView>
                <TextInput
                  autoCapitalize={'none'}
                  keyboardType={'numeric'}
                  onChangeText={setBarcodeValue}
                  onSubmitEditing={handleOnSave.bind(null, {
                    onClosePress,
                    onSave,
                    data: barcodeValue
                  })}
                  placeholder={I18n.t('general:scanner.placeholder')}
                  returnKeyType={'done'}
                  value={barcodeValue}
                />

                <Button.Primary
                  title={I18n.t('general:scanner.button')}
                  onPress={handleOnSave.bind(null, {
                    onClosePress,
                    onSave,
                    data: barcodeValue
                  })}
                  disabled={barcodeValue === ''}
                />
              </ColumnView>
            )}
            {showRegularControls && (
              <ColumnView>
                {currentPhoto?.uri ? (
                  <RowView justifyContent={'space-between'}>
                    <Button.Secondary
                      title={I18n.t('screens:deliver.podCamera.retake')}
                      onPress={setCurrentPhoto.bind(null, {})}
                      width={width / 2 - defaults.marginHorizontal * 1.5}
                    />
                    <Button.Primary
                      title={I18n.t('screens:deliver.podCamera.save')}
                      onPress={handleOnSave.bind(null, {
                        onClosePress,
                        onSave,
                        data: currentPhoto
                      })}
                      width={width / 2 - defaults.marginHorizontal * 1.5}
                    />
                  </RowView>
                ) : (
                  <Icon
                    name={'circle'}
                    backgroundColor={alphaColor('whiteOnly', 0.5)}
                    color={'white'}
                    onPress={handleCapture.bind(null, {
                      cameraRef,
                      setCurrentPhoto
                    })}
                    size={buttonAccessibility}
                    containerSize={buttonAccessibility * 1.2}
                  />
                )}
              </ColumnView>
            )}
          </ColumnView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {currentPhoto?.uri && (
        <View
          style={{
            ...style.imageOverlay,
            ...(squareImage && {
              height: minSquare,
              top: (height - minSquare) / 2
            })
          }}>
          <Image
            source={{ uri: currentPhoto?.uri }}
            style={{
              width,
              height,
              ...(squareImage && {
                height: minSquare
              })
            }}
          />
        </View>
      )}
      <RNCamera
        flashMode={FlashModes[flashModeIndex].type}
        ref={cameraRef}
        {...(showBarCodeScanner && {
          onBarCodeScanned: handleBarcodeScanned.bind(null, {
            onClosePress,
            onSave
          })
        })}
        style={{
          ...style.cameraScanner,
          ...(squareImage && {
            height: minSquare,
            top: (height - minSquare) / 2
          })
        }}
      />
    </View>
  );
};

Camera.propTypes = {
  buttonAccessibility: PropTypes.number,
  flashModeIndex: PropTypes.number,
  onClosePress: PropTypes.func,
  onSave: PropTypes.func,
  showBarCodeScanner: PropTypes.bool,
  showRegularControls: PropTypes.bool,
  squareImage: PropTypes.bool,
  updateProps: PropTypes.func
};

export default Camera;
