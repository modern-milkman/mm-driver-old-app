import React from 'react';
import PropTypes from 'prop-types';
import { Pressable } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import actionSheet from 'Services/actionSheet';
import { sizes, colors, defaults } from 'Theme';
import NavigationService from 'Navigation/service';
import { SafeAreaView, RowView, ColumnView } from 'Containers';
import { Image, Button, NavBar, Text, TextInput } from 'Components';

import { renderProgressBar } from '../shared';

import style from './style';

const sectionList = ['right', 'rear', 'left', 'front'];

const openActionSheet = (key, addImage) => {
  actionSheet({
    [I18n.t('general:takePhoto')]: openPicker.bind(
      null,
      'openCamera',
      key,
      addImage
    ),
    [I18n.t('general:openGalery')]: openPicker.bind(
      null,
      'openPicker',
      key,
      addImage
    )
  });
};

const openPicker = (method, key, addImage) => {
  ImagePicker[method]({
    width: 1000,
    height: 1000,
    cropping: true,

    includeBase64: true
  }).then(img => {
    addImage(key, img.path, img.mime);
  });
};

const DamageReport = ({
  payload,
  deleteVanDamageImage,
  setVanDamageComment,
  setVanDamageImage
}) => {
  const { vehicleCheckDamage } = payload;
  let skip = true;
  for (const section of sectionList) {
    if (
      vehicleCheckDamage[section]?.comments?.length > 0 ||
      vehicleCheckDamage[section]?.vehicleCheckDamageImage?.length > 0
    ) {
      skip = false;
    }
  }
  const mainActionTitle = I18n.t(`general:${skip ? 'skip' : 'next'}`);

  return (
    <SafeAreaView top bottom>
      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack.bind()}
          title={I18n.t('screens:damageReport.title')}
          rightAction={NavigationService.navigate.bind(null, {
            routeName: 'Checklist'
          })}
          rightText={mainActionTitle}
          testID={'damageReport-navbar'}
        />
        {renderProgressBar(payload.shiftStart ? 3 : 2, payload)}
        <ColumnView
          flex={1}
          justifyContent={'space-between'}
          alignItems={'stretch'}>
          <ColumnView
            width={'auto'}
            alignItems={'stretch'}
            marginHorizontal={defaults.marginHorizontal}
            paddingTop={defaults.marginVertical}
            scrollable>
            {sectionList.map((key, idx) =>
              renderSection(
                deleteVanDamageImage,
                setVanDamageComment,
                setVanDamageImage,
                vehicleCheckDamage[key],
                key,
                idx,
                sectionList.length
              )
            )}
          </ColumnView>

          <RowView
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}
            marginBottom={defaults.marginVertical}>
            <Button.Primary
              title={mainActionTitle}
              onPress={NavigationService.navigate.bind(null, {
                routeName: 'Checklist'
              })}
              testID={'damageReport-mainNext-btn'}
            />
          </RowView>
        </ColumnView>
      </ColumnView>
    </SafeAreaView>
  );
};

const onTextChange = (setVanDamageComment, item, text) => {
  setVanDamageComment(item, text);
};

const renderSection = (
  deleteVanDamageImage,
  setVanDamageComment,
  setVanDamageImage,
  section,
  key,
  idx,
  length
) => {
  return (
    <ColumnView
      width={'auto'}
      key={key}
      justifyContent={'flex-start'}
      alignItems={'stretch'}>
      <Text.Label color={colors.inputDark}>
        {I18n.t(`screens:damageReport.sections.${key}`)}
      </Text.Label>

      <RowView
        justifyContent={'flex-start'}
        testID={'damageReport-imageRow-' + key}
        marginVertical={defaults.marginVertical / 2}>
        {(!section || section.vehicleCheckDamageImage.length < 3) && (
          <CustomIcon
            onPress={openActionSheet.bind(null, key, setVanDamageImage)}
            containerWidth={sizes.list.image}
            width={sizes.list.image}
            icon={'addPhoto'}
            iconColor={colors.Primary}
            style={style.addPhotoIcon}
          />
        )}

        {section &&
          section.vehicleCheckDamageImage &&
          section.vehicleCheckDamageImage.length > 0 &&
          section.vehicleCheckDamageImage.map((image, index) => (
            <Pressable
              key={key + index}
              style={style.photoWrapper}
              onPress={deleteVanDamageImage.bind(null, key, index)}>
              <Image
                source={{
                  uri: image.imagePath
                }}
                style={{ borderRadius: defaults.borderRadius }}
                width={sizes.list.image}
                height={sizes.list.image}
              />
              <CustomIcon
                onPress={deleteVanDamageImage.bind(null, key, index)}
                icon={'close'}
                containerWidth={sizes.list.image / 2}
                style={style.closeIcon}
              />
            </Pressable>
          ))}

        {(!section || section.vehicleCheckDamageImage.length === 0) && (
          <>
            <CustomIcon
              disabled
              containerWidth={sizes.list.image}
              width={sizes.list.image}
              icon={'blank'}
              iconColor={colors.inputDark}
              bgColor={colors.white}
              style={style.addPhotoIcon}
            />
            <CustomIcon
              disabled
              containerWidth={sizes.list.image}
              width={sizes.list.image}
              icon={'blank'}
              iconColor={colors.inputDark}
              bgColor={colors.white}
              style={style.addPhotoIcon}
            />
          </>
        )}
        {section?.vehicleCheckDamageImage.length === 1 && (
          <CustomIcon
            disabled
            containerWidth={sizes.list.image}
            width={sizes.list.image}
            icon={'blank'}
            iconColor={colors.inputDark}
            bgColor={colors.white}
            style={style.addPhotoIcon}
          />
        )}
      </RowView>

      <TextInput
        onChangeText={onTextChange.bind(null, setVanDamageComment, key)}
        maxLength={300}
        multiline
        multilineHeight={100}
        placeholder={I18n.t('input:placeholder.damageReport')}
        value={section?.comments}
        testID={`damageReport-issues${key}-textInput`}
      />
    </ColumnView>
  );
};

DamageReport.propTypes = {
  deleteVanDamageImage: PropTypes.func,
  setVanDamageComment: PropTypes.func,
  setVanDamageImage: PropTypes.func,
  payload: PropTypes.object
};

export default DamageReport;
