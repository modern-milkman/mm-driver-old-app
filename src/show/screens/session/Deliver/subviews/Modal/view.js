import React from 'react';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { TouchableOpacity } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import ImagePicker from 'react-native-image-crop-picker';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import actionSheet from 'Services/actionSheet';
import { ColumnView, RowView } from 'Containers';
import NavigationService from 'Navigation/service';
import { deviceFrame, formatDate, mock } from 'Helpers';
import { alphaColor, colors, defaults, sizes } from 'Theme';
import {
  Button,
  Text,
  TextInput,
  Image,
  Label,
  List,
  Separator
} from 'Components';

import style from './style';

const { width, height } = deviceFrame();

const hideClaimsModal = (toggleModal) => {
  toggleModal('showClaimModal', false);
  NavigationService.goBack();
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

const openPicker = ({ driverResponse, method, updateDriverResponse }) => {
  ImagePicker[method]({
    width: 1000,
    height: 1000,
    cropping: true,

    includeBase64: true
  }).then((img) => {
    updateDriverResponse({
      text: driverResponse?.text,
      image: `data:${img.mime};base64,${img.data}`,
      imageType: img.mime
    });
  });
};

const productImageUri = `${Config.SERVER_URL}${Config.SERVER_URL_BASE}/Product/Image/`;

const renderReplyBody = ({ driverResponse, updateDriverResponse }) => {
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
            iconColor={colors.Primary}
            style={style.addPhotoIcon}
            onPress={openActionSheet.bind(null, {
              driverResponse,
              updateDriverResponse
            })}
          />
        )}
      </RowView>
    </ColumnView>
  );
};

const renderCustomerIssueBody = ({ customerComment, reason, sectionData }) => {
  return (
    <ColumnView maxHeight={height * 0.4}>
      <RowView
        paddingVertical={defaults.marginVertical / 2}
        paddingHorizontal={defaults.marginHorizontal}
        justifyContent={'flex-start'}
        alignItems={'flex-start'}>
        <Text.List color={colors.secondaryLight}>
          {I18n.t('screens:deliver.customerIssue.modal.reason')}
        </Text.List>

        <Text.List color={colors.secondary} flex={1}>
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
            <Text.List color={colors.secondaryLight}>
              {I18n.t('screens:deliver.customerIssue.modal.customerComment')}
            </Text.List>

            <Text.List color={colors.secondary} flex={1}>
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

const CustomerIssueModal = (props) => {
  const {
    claims: {
      driverResponse,
      driverUnacknowledgedNr,
      selectedClaim,
      showedUnacknowledgedNr
    },
    driverReply,
    processing,
    showReplyModal,
    showClaimModal,
    toggleModal,
    updateDriverResponse
  } = props;

  const {
    claimDateTime,
    claimItem,
    customerComment,
    finalEscalation,
    reason
  } = selectedClaim;

  const sectionData = [
    {
      title: I18n.t('screens:deliver.customerIssue.modal.productsAffected'),
      data: claimItem.map((item) => {
        return {
          disabled: true,
          image: `${productImageUri}${item.productId}`,
          title: item.productName
        };
      })
    }
  ];

  return (
    <ColumnView flex={1} backgroundColor={alphaColor('secondary', 0.85)}>
      <NavigationEvents
        onDidBlur={toggleModal.bind(null, 'showReplyModal', !showReplyModal)}
      />

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
              <Text.Heading color={colors.secondary}>
                {showReplyModal
                  ? I18n.t('screens:deliver.customerIssue.modal.title')
                  : I18n.t('screens:deliver.customerIssue.modal.customerIssue')}
              </Text.Heading>
            </RowView>

            {!showReplyModal && (
              <Text.Heading color={colors.secondaryLight}>
                {` ${showedUnacknowledgedNr} / ${driverUnacknowledgedNr}`}
              </Text.Heading>
            )}
          </RowView>

          <Separator color={colors.input} width={'100%'} />

          <RowView
            paddingVertical={defaults.marginVertical / 2}
            paddingHorizontal={defaults.marginHorizontal}
            justifyContent={'space-between'}>
            <RowView flex={1} justifyContent={'flex-start'}>
              <Text.List color={colors.secondaryLight}>
                {I18n.t('screens:deliver.customerIssue.modal.date')}
              </Text.List>
              <Text.List color={colors.secondary}>
                {formatDate(new Date(claimDateTime))}
              </Text.List>
            </RowView>
            {finalEscalation && (
              <Label
                text={I18n.t(
                  'screens:deliver.customerIssue.modal.finalEscalation'
                )}
              />
            )}
          </RowView>

          <Separator color={colors.input} width={'100%'} />

          {showReplyModal
            ? renderReplyBody({ driverResponse, updateDriverResponse })
            : renderCustomerIssueBody({ customerComment, reason, sectionData })}

          <Separator color={colors.input} width={'100%'} />
          <RowView>
            <Button.Tertiary
              title={I18n.t(showReplyModal ? 'general:cancel' : 'general:hide')}
              width={'50%'}
              noBorderRadius
              onPress={
                showReplyModal
                  ? toggleModal.bind(null, 'showReplyModal', !showReplyModal)
                  : hideClaimsModal.bind(null, toggleModal)
              }
              disabled={processing}
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
              processing={processing}
              onPress={
                showReplyModal
                  ? driverReply.bind(
                      null,
                      selectedClaim.claimId,
                      driverResponse?.text,
                      driverResponse?.image,
                      driverResponse?.imageType,
                      !showClaimModal
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
  claims: PropTypes.object,
  driverReply: PropTypes.func,
  processing: PropTypes.bool,
  showClaimModal: PropTypes.bool,
  showReplyModal: PropTypes.bool,
  toggleModal: PropTypes.func,
  updateDriverResponse: PropTypes.func
};

CustomerIssueModal.defaultProps = {
  claims: {},
  driverReply: mock,
  processing: false,
  showClaimModal: false,
  showReplyModal: false,
  toggleModal: mock,
  updateDriverResponse: mock
};

export default CustomerIssueModal;
