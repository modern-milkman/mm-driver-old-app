import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import { formatDate, mock } from 'Helpers';
import { SafeAreaView } from 'Containers';
import { List, NavBar, Text } from 'Components';
import NavigationService from 'Navigation/service';

const CustomerIssueList = (props) => {
  const { claims, selectedStop, setSelectedClaim } = props;

  const newList = {
    title: I18n.t('screens:deliver.customerIssue.list.new'),
    data: []
  };
  const previousList = {
    title: I18n.t('screens:deliver.customerIssue.list.previous'),
    data: []
  };

  claims.list.forEach((item, idx) => {
    let date = formatDate(new Date(item.claimDateTime));
    const tempItem = {
      customerIssueIdx: idx + 1,
      claimItem: item.claimItem,
      key: item.claimId,
      description: item.reason,
      date: date,
      miscelaneousTop: I18n.t('screens:deliver.customerIssue.list.dateOrTime', {
        value: date,
        interpolation: { escapeValue: false }
      }),
      MiscelaneousTopTextComponent: Text.Caption,
      miscelaneousBottom: I18n.t(
        'screens:deliver.customerIssue.list.nrReplies',
        { nr: item.driverResponses.length }
      ),
      rightIcon: 'chevron-right',
      icon: null,
      title: I18n.t('screens:deliver.customerIssue.list.title', {
        issueNr: idx + 1
      }),
      onPress: setSelectedClaim.bind(null, {
        ...item,
        customerIssueIdx: idx + 1
      })
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

      tempItem.miscelaneousTop = I18n.t(
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

  const listItems = [];
  if (newList.data.length > 0) {
    listItems.push(newList);
  }
  if (previousList.data.length > 0) {
    listItems.push(previousList);
  }

  return (
    <SafeAreaView top bottom>
      <NavBar
        leftIcon={'chevron-left'}
        leftIconAction={NavigationService.goBack}
        title={I18n.t('screens:deliver.customerIssue.list.clientIdIssues', {
          cId: selectedStop?.customerId
        })}
      />

      <List data={listItems} hasSections />
    </SafeAreaView>
  );
};

CustomerIssueList.propTypes = {
  claims: PropTypes.object,
  selectedStop: PropTypes.object,
  setSelectedClaim: PropTypes.func
};

CustomerIssueList.defaultProps = {
  claims: {},
  selectedStop: {},
  setSelectedClaim: mock
};

export default CustomerIssueList;
