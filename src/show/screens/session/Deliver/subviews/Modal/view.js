import React from 'react';
import RNFS from 'react-native-fs';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import ImagePicker from 'react-native-image-crop-picker';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler, TouchableOpacity } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import actionSheet from 'Services/actionSheet';
import NavigationService from 'Services/navigation';
import { deviceFrame, formatDate, mock } from 'Helpers';
import { defaults, sizes } from 'Theme';
import { ColumnView, RowView, useTheme, useThemedStyles } from 'Containers';
import {
  Button,
  Text,
  TextInput,
  Icon,
  Image,
  Label,
  List,
  Separator
} from 'Components';

import unthemedStyle from './style';

const hideClaimsModal = toggleModal => {
  toggleModal('showClaimModal', false);
  window.setTimeout(toggleModal.bind(null, 'showReplyModal', false), 250);
  //prevents flicker when canceling from reply modal
};

const openActionSheet = ({ driverResponse, updateDriverResponse }) => {
  actionSheet({
    [I18n.t('general:takePhoto')]: openPicker.bind(null, {
      driverResponse,
      method: 'openCamera',
      updateDriverResponse
    }),
    [I18n.t('general:openGalery')]: openPicker.bind(null, {
      driverResponse,
      method: 'openPicker',
      updateDriverResponse
    })
  });
};

const openCannedContent = ({
  driverResponse,
  updateDriverResponse,
  cannedContent
}) => {
  if (cannedContent.length <= 0) {
    return;
  }
  const actions = {};

  for (let cc of cannedContent) {
    actions[cc.name] = updateDriverResponse.bind(null, {
      text: cc.description,
      image: driverResponse.image,
      imageType: driverResponse.imageType
    });
  }

  actionSheet(actions);
};

const openPicker = ({ driverResponse, method, updateDriverResponse }) => {
  ImagePicker[method]({
    width: 1000,
    height: 1000,
    cropping: true
  }).then(img => {
    updateDriverResponse({
      text: driverResponse?.text,
      image: img.path,
      imageType: img.mime
    });
  });
};

const renderReplyBody = ({
  cannedContent,
  colors,
  driverResponse,
  updateDriverResponse,
  style
}) => {
  return (
    <ColumnView
      paddingTop={defaults.marginVertical}
      paddingBottom={defaults.marginVertical / 2}
      paddingHorizontal={defaults.marginHorizontal}
      justifyContent={'flex-start'}>
      <TextInput
        onChangeText={updateText.bind(
          this,
          updateDriverResponse,
          driverResponse
        )}
        multiline
        value={driverResponse?.text}
        multilineHeight={100}
        placeholder={I18n.t('input:placeholder.customerIssueModal')}
      />
      <RowView justifyContent={'flex-start'}>
        {driverResponse.image && driverResponse.image !== '' ? (
          <TouchableOpacity
            onPress={updateDriverResponse.bind(null, {
              text: driverResponse?.text,
              image: null,
              imageType: null
            })}
            style={style.photoWrapper}>
            <Image
              source={{
                uri: driverResponse?.image
              }}
              style={{ borderRadius: defaults.borderRadius }}
              width={sizes.list.image}
              height={sizes.list.image}
            />
            <CustomIcon
              icon={'close'}
              containerWidth={sizes.list.image / 2}
              style={style.closeIcon}
              onPress={updateDriverResponse.bind(null, {
                text: driverResponse?.text,
                image: null,
                imageType: null
              })}
            />
          </TouchableOpacity>
        ) : (
          <CustomIcon
            containerWidth={sizes.list.image}
            width={sizes.list.image}
            icon={'addPhoto'}
            iconColor={colors.input}
            bgColor={colors.primary}
            style={style.addPhotoIcon}
            onPress={openActionSheet.bind(null, {
              driverResponse,
              updateDriverResponse
            })}
          />
        )}

        {cannedContent.length > 0 && (
          <TouchableOpacity
            onPress={openCannedContent.bind(null, {
              driverResponse,
              updateDriverResponse,
              cannedContent
            })}>
            <RowView
              marginLeft={defaults.marginVertical / 4}
              justifyContent={'flex-start'}
              width={sizes.list.image}
              height={sizes.list.image}
              backgroundColor={colors.inputSecondary}
              borderRadius={defaults.borderRadius}>
              <Icon
                name={'quickreply'}
                type={'material'}
                size={sizes.list.image / 2}
                containerSize={44}
                color={colors.input}
                disabled
              />
            </RowView>
          </TouchableOpacity>
        )}
      </RowView>
    </ColumnView>
  );
};

const renderCustomerIssueBody = ({
  customerComment = '',
  colors,
  reason = '',
  sectionData = [],
  height
}) => {
  return (
    <ColumnView maxHeight={height * 0.4}>
      <RowView
        paddingVertical={defaults.marginVertical / 2}
        paddingHorizontal={defaults.marginHorizontal}
        justifyContent={'flex-start'}
        alignItems={'flex-start'}>
        <Text.List color={colors.inputSecondary}>
          {I18n.t('screens:deliver.customerIssue.modal.reason')}
        </Text.List>

        <Text.List color={colors.inputSecondary} flex={1}>
          {reason}
        </Text.List>
      </RowView>

      {customerComment?.length > 0 && (
        <>
          <Separator color={colors.input} width={'100%'} />
          <RowView
            paddingHorizontal={defaults.marginHorizontal}
            paddingVertical={defaults.marginVertical / 2}
            justifyContent={'flex-start'}
            alignItems={'flex-start'}>
            <Text.List color={colors.inputSecondary}>
              {I18n.t('screens:deliver.customerIssue.modal.customerComment')}
            </Text.List>

            <Text.List color={colors.inputSecondary} flex={1}>
              {customerComment}
            </Text.List>
          </RowView>
        </>
      )}

      <Separator color={colors.input} width={'100%'} />

      <List data={sectionData} hasSections />
    </ColumnView>
  );
};

const updateText = (updateDriverResponse, driverResponse, text) => {
  updateDriverResponse({
    image: driverResponse?.image,
    imageType: driverResponse?.imageType,
    text
  });
};

const CustomerIssueModal = props => {
  const style = useThemedStyles(unthemedStyle);
  const { alphaColor, colors } = useTheme();
  const {
    cannedContent,
    claims: {
      acknowledgedList,
      selectedClaimId,
      showClaimModal,
      showCount,
      showReplyModal,
      unacknowledgedList,
      unacknowledgedListNr
    },
    driverReply,
    driverResponse,
    toggleModal,
    updateDriverResponse
  } = props;

  const { width, height } = deviceFrame();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        toggleModal('showClaimModal', false);
        toggleModal('showReplyModal', false);
        NavigationService.goBack();

        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [toggleModal])
  );

  let selectedClaimData;
  if (unacknowledgedList?.length > 0) {
    selectedClaimData = unacknowledgedList.filter(
      claim => claim.claimId === selectedClaimId
    )[0];
  }

  if (!selectedClaimData) {
    selectedClaimData = acknowledgedList.filter(
      claim => claim.claimId === selectedClaimId
    )[0];
  }

  const sectionData = [
    {
      title: I18n.t('screens:deliver.customerIssue.modal.productsAffected'),
      data:
        selectedClaimData?.claimItem.map(item => {
          return {
            disabled: true,
            image: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${item.productId}`,
            customIcon: 'productPlaceholder',
            title: item.productName
          };
        }) || []
    }
  ];

  return (
    <ColumnView flex={1} backgroundColor={alphaColor('blackOnly', 0.85)}>
      <ColumnView
        backgroundColor={'transparent'}
        marginHorizontal={defaults.marginHorizontal}
        width={width - defaults.marginHorizontal * 2}
        flex={1}>
        <ColumnView
          alignItems={'flex-start'}
          backgroundColor={colors.neutral}
          borderRadius={defaults.borderRadius}
          overflow={'hidden'}>
          <RowView
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingVertical={defaults.marginVertical / 2}
            paddingHorizontal={defaults.marginHorizontal}>
            <RowView
              justifyContent={'flex-start'}
              flex={1}
              alignItems={'center'}>
              <CustomIcon
                containerWidth={Text.Heading.height}
                width={Text.Heading.height}
                icon={showReplyModal ? 'customerIssue' : 'warning'}
                iconColor={colors.error}
                bgColor={'transparent'}
                disabled
              />
              <Text.Heading color={colors.inputSecondary}>
                {showReplyModal
                  ? I18n.t('screens:deliver.customerIssue.modal.title')
                  : I18n.t('screens:deliver.customerIssue.modal.customerIssue')}
              </Text.Heading>
            </RowView>

            {!showReplyModal && (
              <Text.Heading
                color={
                  colors.inputSecondary
                }>{` ${showCount} / ${unacknowledgedListNr}`}</Text.Heading>
            )}
          </RowView>

          <Separator color={colors.input} width={'100%'} />

          <RowView
            paddingVertical={defaults.marginVertical / 2}
            paddingHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}>
            <RowView flex={1} justifyContent={'flex-start'}>
              <Text.List color={colors.inputSecondary}>
                {I18n.t('screens:deliver.customerIssue.modal.date')}
              </Text.List>
              <Text.List color={colors.inputSecondary}>
                {formatDate(new Date(selectedClaimData?.claimDateTime))}
              </Text.List>
            </RowView>
            {selectedClaimData?.finalEscalation && (
              <Label
                text={I18n.t(
                  'screens:deliver.customerIssue.modal.finalEscalation'
                )}
              />
            )}
          </RowView>

          <Separator color={colors.input} width={'100%'} />

          {showReplyModal
            ? renderReplyBody({
                cannedContent,
                colors,
                driverResponse,
                updateDriverResponse,
                style
              })
            : renderCustomerIssueBody({
                customerComment: selectedClaimData?.customerComment,
                reason: selectedClaimData?.reason,
                colors,
                sectionData,
                height
              })}

          <Separator color={colors.input} width={'100%'} />
          <RowView>
            <Button.Tertiary
              title={I18n.t(showReplyModal ? 'general:cancel' : 'general:hide')}
              width={'50%'}
              noBorderRadius
              onPress={NavigationService.goBack.bind(null, {
                beforeCallback: hideClaimsModal.bind(null, toggleModal)
              })}
            />

            <Button.Primary
              title={I18n.t(
                showReplyModal
                  ? 'screens:deliver.customerIssue.modal.send'
                  : 'screens:deliver.customerIssue.modal.reply'
              )}
              disabled={
                showReplyModal &&
                !driverResponse?.image &&
                !driverResponse?.text
              }
              width={'50%'}
              noBorderRadius
              onPress={
                showReplyModal
                  ? driverReply.bind(
                      null,
                      selectedClaimData?.claimId,
                      driverResponse?.text,
                      driverResponse?.image,
                      driverResponse?.imageType,
                      !showClaimModal,
                      selectedClaimData.index - 1
                    )
                  : toggleModal.bind(null, 'showReplyModal', !showReplyModal)
              }
            />
          </RowView>
        </ColumnView>
      </ColumnView>
    </ColumnView>
  );
};

CustomerIssueModal.propTypes = {
  cannedContent: PropTypes.array,
  claims: PropTypes.object,
  driverReply: PropTypes.func,
  driverResponse: PropTypes.object,
  toggleModal: PropTypes.func,
  updateDriverResponse: PropTypes.func
};

CustomerIssueModal.defaultProps = {
  cannedContent: [],
  claims: { unacknowledgedList: [], acknowledgedList: [] },
  driverReply: mock,
  driverResponse: {},
  toggleModal: mock,
  updateDriverResponse: mock
};

export default CustomerIssueModal;
