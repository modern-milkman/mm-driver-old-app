import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import { formatDate, mock } from 'Helpers';
import { defaults, colors, sizes } from 'Theme';
import NavigationService from 'Navigation/service';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import { Button, NavBar, Separator, List, ListItem } from 'Components';

const CustomerIssueDetails = (props) => {
  const { selectedIssue, toggleReplyModal } = props;

  const {
    driverResponses,
    customerIssueIdx,
    date,
    reason,
    claimItem
  } = selectedIssue;

  const data = claimItem?.map((item) => {
    return {
      disabled: true,
      image: item.productId.toString(),
      title: item.productName
    };
  });

  const driverReplyData = driverResponses?.map((item, idx) => {
    return {
      disabled: true,
      customIcon: 'customerIssue',
      customIconProps: {
        width: sizes.list.image / 2,
        containerWidth: sizes.list.image
      },
      title: I18n.t('screens:deliver.customerIssue.list.title', {
        idx: idx + 1
      }),
      description: formatDate(new Date(item.responseDateTime)),
      moreInfo: item.comment
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

      <ColumnView flex={1}>
        <Separator color={colors.input} width={'100%'} />

        <ListItem title={reason} description={date} icon={null} />

        <Separator color={colors.input} width={'100%'} />

        {data && data.length > 0 && (
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
        )}

        <Separator color={colors.input} width={'100%'} />

        {driverReplyData && driverReplyData.length > 0 && (
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
        )}
      </ColumnView>

      <RowView paddingHorizontal={defaults.marginHorizontal}>
        <Button.Secondary
          title={I18n.t('screens:deliver.customerIssue.modal.reply')}
          onPress={toggleReplyModal.bind(null, null, true)}
        />
      </RowView>
    </SafeAreaView>
  );
};

CustomerIssueDetails.propTypes = {
  claims: PropTypes.object,
  selectedIssue: PropTypes.object,
  toggleReplyModal: PropTypes.func
};

CustomerIssueDetails.defaultProps = {
  claims: {},
  selectedIssue: {},
  toggleReplyModal: mock
};

export default CustomerIssueDetails;
