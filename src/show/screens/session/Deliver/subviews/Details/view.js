import React from 'react';
import RNFS from 'react-native-fs';
import PropTypes from 'prop-types';
import Config from 'react-native-config';

import I18n from 'Locales/I18n';
import { formatDate, mock } from 'Helpers';
import { defaults, colors, sizes } from 'Theme';
import NavigationService from 'Navigation/service';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import { Button, NavBar, Separator, Label, List, ListItem } from 'Components';

const showReplyModal = (toggleModal) => {
  toggleModal('showReplyModal', true);

  NavigationService.navigate({
    routeName: 'CustomerIssueModal'
  });
};

const CustomerIssueDetails = (props) => {
  const { selectedClaim, toggleModal } = props;

  const {
    claimItem,
    claimDateTime,
    customerComment,
    index,
    driverResponses,
    finalEscalation,
    reason
  } = selectedClaim;

  const data = claimItem?.map((item) => {
    return {
      customIcon: 'productPlaceholder',
      disabled: true,
      image: `${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${item.productId}`,
      title: item.productName
    };
  });

  const driverReplyData = driverResponses?.map((item, idx) => {
    const driverReplyDate = new Date(item.responseDateTime);

    const driverReplyTime = driverReplyDate.toLocaleString('en-UK', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    return {
      disabled: true,
      customIcon: 'customerIssue',
      customIconProps: {
        width: sizes.list.image
      },
      title: I18n.t('screens:deliver.customerIssue.modal.listTitle', {
        id: idx + 1
      }),
      description: I18n.t('screens:deliver.customerIssue.details.dateTime', {
        date: formatDate(driverReplyDate),
        time: driverReplyTime,
        interpolation: { escapeValue: false }
      }),
      moreInfo: item.comment,
      image: item.hasImage
        ? `${RNFS.DocumentDirectoryPath}/${Config.FS_DRIVER_REPLY_IMAGES}/${item.claimDriverResponseId}`
        : null
    };
  });

  const listData = [];

  if (customerComment?.length > 0) {
    listData.push({
      title: I18n.t('screens:deliver.customerIssue.modal.customerComment'),
      data: [
        {
          disabled: true,
          customIcon: 'customerIssue',
          customIconProps: {
            width: sizes.list.image
          },
          title: customerComment
        }
      ]
    });
  }

  if (data && data.length) {
    listData.push({
      title: I18n.t('screens:deliver.customerIssue.modal.productsAffected'),
      data: data
    });
  }

  if (driverReplyData && driverReplyData.length) {
    listData.push({
      title: I18n.t('screens:deliver.customerIssue.details.driverReplies'),
      data: driverReplyData
    });
  } else {
    listData.push({
      title: I18n.t('screens:deliver.customerIssue.details.driverReplies'),
      data: [
        {
          disabled: true,
          title: I18n.t('screens:deliver.customerIssue.details.noReplies')
        }
      ]
    });
  }

  return (
    <SafeAreaView top bottom>
      <NavBar
        leftIcon={'chevron-left'}
        leftIconAction={NavigationService.goBack}
        title={I18n.t('screens:deliver.customerIssue.list.title', {
          issueNr: index
        })}
      />

      <ColumnView flex={1} justifyContent={'flex-start'}>
        <Separator color={colors.input} width={'100%'} />

        <ListItem
          disabled
          title={reason}
          description={formatDate(new Date(claimDateTime))}
          icon={null}
          {...(finalEscalation && {
            rightComponent: (
              <Label
                text={I18n.t(
                  'screens:deliver.customerIssue.modal.finalEscalation'
                )}
              />
            )
          })}
        />

        <Separator color={colors.input} width={'100%'} />

        {listData.length > 0 && (
          <ColumnView flex={1}>
            <List data={listData} hasSections />
          </ColumnView>
        )}
      </ColumnView>

      <RowView
        paddingHorizontal={defaults.marginHorizontal}
        marginVertical={defaults.marginVertical}>
        <Button.Secondary
          title={I18n.t('screens:deliver.customerIssue.modal.reply')}
          onPress={showReplyModal.bind(null, toggleModal)}
        />
      </RowView>
    </SafeAreaView>
  );
};

CustomerIssueDetails.propTypes = {
  selectedClaim: PropTypes.object,
  toggleModal: PropTypes.func
};

CustomerIssueDetails.defaultProps = {
  selectedClaim: {},
  toggleModal: mock
};

export default CustomerIssueDetails;
