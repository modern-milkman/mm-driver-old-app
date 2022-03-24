import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import { formatDate, mock } from 'Helpers';
import NavigationService from 'Services/navigation';
import { SafeAreaView, useTheme } from 'Containers';
import { List, ListHeader, NavBar, Text } from 'Components';

const CustomerIssueList = props => {
  const { colors } = useTheme();
  const { claims, selectedStop, setSelectedClaimId } = props;

  const newList = {
    title: I18n.t('screens:deliver.customerIssue.list.new'),
    data: []
  };
  const previousList = {
    title: I18n.t('screens:deliver.customerIssue.list.previous'),
    data: []
  };
  const listItems = [];

  if (claims?.acknowledgedList && claims?.acknowledgedList.length > 0) {
    claims.acknowledgedList.forEach(item => {
      let date = formatDate(new Date(item.claimDateTime));
      const tempItem = {
        claimItem: item.claimItem,
        key: item.claimId,
        description: item.reason,
        date: date,
        suffixTop: I18n.t('screens:deliver.customerIssue.list.dateOrTime', {
          value: date,
          interpolation: { escapeValue: false }
        }),
        SuffixTopTextComponent: Text.Caption,
        suffixBottom: I18n.t('screens:deliver.customerIssue.list.nrReplies', {
          nr: item.driverResponses.length
        }),
        rightIcon: item.finalEscalation ? 'alert' : 'chevron-right',
        rightIconColor: item.finalEscalation ? colors.error : colors.primary,
        icon: null,
        title: I18n.t('screens:deliver.customerIssue.list.title', {
          issueNr: item.index
        }),
        onPress: setSelectedClaimId.bind(null, item.claimId)
      };

      if (
        new Date(item.claimDateTime).valueOf() >
        new Date().setHours(0, 0, 0, 0).valueOf()
      ) {
        date = new Date(item.claimDateTime).toLocaleString('en-UK', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });

        tempItem.suffixTop = I18n.t(
          'screens:deliver.customerIssue.list.dateOrTime',
          { value: date }
        );
      }

      if (
        new Date(item.claimDateTime).valueOf() >
        new Date().valueOf() - 24 * 60 * 60 * 1000
      ) {
        newList.data.push(tempItem);
      } else {
        previousList.data.push(tempItem);
      }
    });

    if (newList.data.length > 0) {
      listItems.push(newList);
    }
    if (previousList.data.length > 0) {
      listItems.push(previousList);
    }
  }

  return (
    <SafeAreaView>
      <NavBar
        leftIcon={'chevron-left'}
        leftIconAction={NavigationService.goBack}
        title={I18n.t('screens:deliver.customerIssue.list.clientIdIssues', {
          cId: selectedStop?.customerId
        })}
      />

      {listItems.length > 0 ? (
        <List data={listItems} hasSections />
      ) : (
        <ListHeader
          title={I18n.t('screens:deliver.customerIssue.list.empty')}
        />
      )}
    </SafeAreaView>
  );
};

CustomerIssueList.propTypes = {
  claims: PropTypes.object,
  selectedStop: PropTypes.object,
  setSelectedClaimId: PropTypes.func
};

CustomerIssueList.defaultProps = {
  claims: {},
  selectedStop: {},
  setSelectedClaimId: mock
};

export default CustomerIssueList;
