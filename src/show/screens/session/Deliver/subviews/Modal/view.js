import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { colors, defaults, sizes } from 'Theme';
import { deviceFrame, formatDate, mock } from 'Helpers';
import { Modal, ColumnView, RowView } from 'Containers';
import { Button, Text, TextInput, Image, List, Separator } from 'Components';

import style from './style';

const { width } = deviceFrame();

const CustomerIssueModal = (props) => {
  const {
    claims: {
      driverResponse,
      driverUnacknowledgedNr,
      list,
      selectedId,
      showClaimModal,
      showedUnacknowledgedNr,
      showReplyModal
    },
    toggleReplyModal,
    acknowledgeClaim,
    updateDriverResponse,
    driverReply
  } = props;

  const { text, image, imageType } = driverResponse;

  const selected = list.filter((item) => item.claimId === selectedId)[0] || {};
  const { claimDateTime = '', reason = '', claimItem = [] } = selected;

  const data = claimItem.map((item) => {
    return {
      disabled: true,
      image: item.productId,
      title: item.productName
    };
  });

  const openPicker = () => {
    ImagePicker.openPicker({
      width: 1000,
      height: 1000,
      cropping: true,

      includeBase64: true
    }).then((img) => {
      updateDriverResponse(
        null,
        `data:${img.mime};base64,${img.data}`,
        img.mime
      );
    });
  };

  return (
    <Modal visible={showClaimModal || showReplyModal} transparent={true}>
      <ColumnView
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
            paddingVertical={defaults.marginVertical / 2}
            paddingHorizontal={defaults.marginHorizontal / 2}>
            <RowView justifyContent={'flex-start'} flex={1}>
              <CustomIcon
                containerWidth={28}
                icon={showReplyModal ? 'customerIssue' : 'warning'}
                iconColor={colors.error}
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
            ? renderReplyBody({ updateDriverResponse, image, text, openPicker })
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
              onPress={toggleReplyModal.bind(null, null, !showReplyModal)}
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
              onPress={
                showReplyModal
                  ? driverReply.bind(null, selectedId, text, image, imageType)
                  : acknowledgeClaim.bind(null, selectedId)
              }
            />
          </RowView>
        </ColumnView>
      </ColumnView>
    </Modal>
  );
};

const renderReplyBody = ({ updateDriverResponse, image, text, openPicker }) => {
  return (
    <ColumnView
      paddingTop={defaults.marginVertical}
      paddingBottom={defaults.marginVertical / 2}
      paddingHorizontal={defaults.marginHorizontal / 2}
      justifyContent={'flex-start'}>
      <TextInput
        onChangeText={updateDriverResponse}
        multiline
        value={text}
        multilineHeight={100}
        placeholder={I18n.t(
          'screens:deliver.customerIssue.modal.inputPlaceholder'
        )}
      />
      <RowView justifyContent={'flex-start'}>
        {image && image !== '' ? (
          <TouchableOpacity
            onPress={updateDriverResponse.bind(null, null, '')}
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
              onPress={updateDriverResponse.bind(null, null, '')}
            />
          </TouchableOpacity>
        ) : (
          <CustomIcon
            containerWidth={sizes.list.image}
            width={sizes.list.image}
            icon={'addPhoto'}
            iconColor={colors.Primary}
            style={style.addPhotoIcon}
            onPress={openPicker}
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
  claims: PropTypes.object,
  driverReply: PropTypes.func,
  acknowledgeClaim: PropTypes.func,
  toggleReplyModal: PropTypes.func,
  updateDriverResponse: PropTypes.func
};

CustomerIssueModal.defaultProps = {
  acknowledgeClaim: mock,
  claims: {},
  driverReply: mock,
  toggleReplyModal: mock,
  updateDriverResponse: mock
};

export default CustomerIssueModal;
