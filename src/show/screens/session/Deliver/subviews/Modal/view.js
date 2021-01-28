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
import { Button, Text, TextInput, Image, List, Separator } from 'Components';

import style from './style';

const { width } = deviceFrame();
const productImageUri = `${Config.SERVER_URL}${Config.SERVER_URL_BASE}/Product/Image/`;

const CustomerIssueModal = (props) => {
  const {
    acknowledgeClaim,
    claims: {
      driverResponse,
      driverUnacknowledgedNr,
      selectedClaim,
      showedUnacknowledgedNr
    },
    driverReply,
    processing,
    selectedStopId,
    showReplyModal,
    showClaimModal,
    toggleReplyModal,
    updateDriverResponse
  } = props;

  const { text, image, imageType } = driverResponse;

  const { claimDateTime = '', reason = '', claimItem = [] } = selectedClaim;

  const data = claimItem.map((item) => {
    return {
      disabled: true,
      image: `${productImageUri}${item.productId}`,
      title: item.productName
    };
  });

  const openActionSheet = () => {
    actionSheet({
      [I18n.t('general:takePhoto')]: openPicker.bind(null, 'openCamera'),
      [I18n.t('general:openGalery')]: openPicker.bind(null, 'openPicker')
    });
  };

  const openPicker = (method) => {
    ImagePicker[method]({
      width: 1000,
      height: 1000,
      cropping: true,

      includeBase64: true
    }).then((img) => {
      updateDriverResponse({
        text,
        image: `data:${img.mime};base64,${img.data}`,
        imageType: img.mime
      });
    });
  };

  return (
    <ColumnView flex={1} backgroundColor={alphaColor('secondary', 0.85)}>
      <NavigationEvents
        onDidBlur={toggleReplyModal.bind(null, !showReplyModal)}
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
            paddingHorizontal={defaults.marginHorizontal / 2}>
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
            paddingHorizontal={defaults.marginHorizontal / 2}
            justifyContent={'flex-start'}>
            <Text.List color={colors.secondaryLight}>
              {I18n.t('screens:deliver.customerIssue.modal.date')}
            </Text.List>
            <Text.List color={colors.secondary}>
              {formatDate(new Date(claimDateTime))}
            </Text.List>
          </RowView>

          <Separator color={colors.input} width={'100%'} />

          {showReplyModal
            ? renderReplyBody({
                updateDriverResponse,
                image,
                imageType,
                text,
                openActionSheet
              })
            : renderCustomerIssueBody({ reason, data })}

          <Separator color={colors.input} width={'100%'} />
          <RowView>
            <Button.Tertiary
              title={I18n.t(
                showReplyModal
                  ? 'general:cancel'
                  : 'screens:deliver.customerIssue.modal.reply'
              )}
              width={'50%'}
              noBorderRadius
              onPress={
                showClaimModal
                  ? toggleReplyModal.bind(null, !showReplyModal)
                  : NavigationService.goBack
              }
              disabled={processing}
            />
            <Button.Primary
              title={I18n.t(
                `screens:deliver.customerIssue.modal.${
                  showReplyModal ? 'send' : 'markAsRead'
                }`
              )}
              disabled={showReplyModal && !image && !text}
              width={'50%'}
              noBorderRadius
              processing={processing}
              onPress={
                showReplyModal
                  ? driverReply.bind(
                      null,
                      selectedClaim.claimId,
                      text,
                      image,
                      imageType,
                      showClaimModal
                    )
                  : acknowledgeClaim.bind(
                      null,
                      selectedClaim.claimId,
                      selectedStopId
                    )
              }
            />
          </RowView>
        </ColumnView>
      </ColumnView>
    </ColumnView>
  );
};

const updateText = (updateDriverResponse, image, imageType, text) => {
  updateDriverResponse({ image, imageType, text });
};

const renderReplyBody = ({
  updateDriverResponse,
  image,
  imageType,
  text,
  openActionSheet
}) => {
  return (
    <ColumnView
      paddingTop={defaults.marginVertical}
      paddingBottom={defaults.marginVertical / 2}
      paddingHorizontal={defaults.marginHorizontal / 2}
      justifyContent={'flex-start'}>
      <TextInput
        onChangeText={updateText.bind(
          this,
          updateDriverResponse,
          image,
          imageType
        )}
        multiline
        value={text}
        multilineHeight={100}
        placeholder={I18n.t('input:placeholder.customerIssueModal')}
      />
      <RowView justifyContent={'flex-start'}>
        {image && image !== '' ? (
          <TouchableOpacity
            onPress={updateDriverResponse.bind(null, {
              text,
              image: null,
              imageType: null
            })}
            style={style.photoWrapper}>
            <Image
              source={{
                uri: image
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
                text,
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
            onPress={openActionSheet}
          />
        )}
      </RowView>
    </ColumnView>
  );
};

const renderCustomerIssueBody = ({ reason, data }) => {
  return (
    <>
      <RowView
        paddingTop={defaults.marginVertical}
        paddingBottom={defaults.marginVertical / 2}
        paddingHorizontal={defaults.marginHorizontal / 2}
        justifyContent={'flex-start'}>
        <Text.List color={colors.secondaryLight}>
          {I18n.t('screens:deliver.customerIssue.modal.reason')}
        </Text.List>

        <Text.List color={colors.secondary}>{reason}</Text.List>
      </RowView>

      <ColumnView
        alignItems={'flex-start'}
        paddingVertical={defaults.marginVertical / 4}
        paddingHorizontal={defaults.marginHorizontal / 2}
        justifyContent={'flex-start'}>
        <Text.List color={colors.secondaryLight}>
          {I18n.t('screens:deliver.customerIssue.modal.productsAffected')}
        </Text.List>

        <List listItemStyle={style.listMargin} data={data} />
      </ColumnView>
    </>
  );
};

CustomerIssueModal.propTypes = {
  acknowledgeClaim: PropTypes.func,
  claims: PropTypes.object,
  driverReply: PropTypes.func,
  processing: PropTypes.bool,
  selectedStopId: PropTypes.number,
  showClaimModal: PropTypes.bool,
  showReplyModal: PropTypes.bool,
  toggleReplyModal: PropTypes.func,
  updateDriverResponse: PropTypes.func
};

CustomerIssueModal.defaultProps = {
  acknowledgeClaim: mock,
  claims: {},
  driverReply: mock,
  processing: false,
  showClaimModal: false,
  showReplyModal: false,
  toggleReplyModal: mock,
  updateDriverResponse: mock
};

export default CustomerIssueModal;
