import React from 'react';
import PropTypes from 'prop-types';
import Config from 'react-native-config';

import I18n from 'Locales/I18n';
import { formatDate, mock } from 'Helpers';
import { defaults, colors, sizes } from 'Theme';
import NavigationService from 'Navigation/service';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import { Button, NavBar, Separator, List, ListItem } from 'Components';

const productImageUri = `${Config.SERVER_URL}${Config.SERVER_URL_BASE}/Product/Image/`;

const replyModal = (toggleReplyModal) => {
  toggleReplyModal(true);

  NavigationService.navigate({
    routeName: 'CustomerIssueModal'
  });
};

const CustomerIssueDetails = (props) => {
  const { selectedClaim, toggleReplyModal } = props;

  const {
    claimItem,
    driverResponses,
    claimDateTime,
    customerIssueIdx,
    reason
  } = selectedClaim;

  const data = claimItem?.map((item) => {
    return {
      disabled: true,
      image: productImageUri + item.productId,
      title: item.productName
    };
  });

  const driverReplyData = driverResponses?.map((item, idx) => {
    return {
      disabled: true,
      customIcon: 'customerIssue',
      customIconProps: {
        width: sizes.list.image
      },
      title: I18n.t('screens:deliver.customerIssue.modal.listTitle', {
        id: idx + 1
      }),
      description: formatDate(new Date(item.responseDateTime)),
      moreInfo: item.comment,
      moreInfoImage: item.image
        ? `data:${item.image.imageType};base64,${item.image.base64Image}`
        : null
    };
  });

  return (
    <SafeAreaView top bottom>
      <NavBar
        leftIcon={'chevron-left'}
        leftIconAction={NavigationService.goBack}
        title={I18n.t('screens:deliver.customerIssue.list.title', {
          issueNr: customerIssueIdx
        })}
      />

      <ColumnView flex={1} justifyContent={'flex-start'}>
        <Separator color={colors.input} width={'100%'} />

        <ListItem
          title={reason}
          description={formatDate(new Date(claimDateTime))}
          icon={null}
        />

        <Separator color={colors.input} width={'100%'} />

        {data && data.length > 0 && (
          <ColumnView>
            <List
              data={[
                {
                  title: I18n.t(
                    'screens:deliver.customerIssue.modal.productsAffected'
                  ),
                  data
                }
              ]}
              hasSections
            />
          </ColumnView>
        )}

        {driverReplyData && driverReplyData.length > 0 && (
          <ColumnView flex={1}>
            <List
              data={[
                {
                  title: I18n.t(
                    'screens:deliver.customerIssue.details.driverReplies'
                  ),
                  data: driverReplyData
                }
              ]}
              hasSections
            />
          </ColumnView>
        )}
      </ColumnView>

      <RowView
        paddingHorizontal={defaults.marginHorizontal}
        marginVertical={defaults.marginVertical}>
        <Button.Secondary
          title={I18n.t('screens:deliver.customerIssue.modal.reply')}
          onPress={replyModal.bind(null, toggleReplyModal)}
        />
      </RowView>
    </SafeAreaView>
  );
};

CustomerIssueDetails.propTypes = {
  selectedClaim: PropTypes.object,
  toggleReplyModal: PropTypes.func
};

CustomerIssueDetails.defaultProps = {
  selectedClaim: {},
  toggleReplyModal: mock
};

export default CustomerIssueDetails;
