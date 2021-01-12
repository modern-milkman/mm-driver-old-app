import React from 'react';
import PropTypes from 'prop-types';

import I18n from 'Locales/I18n';
import { formatDate, mock } from 'Helpers';
import { SafeAreaView } from 'Containers';
import { NavBar, List } from 'Components';
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
      miscelaneousSmall: I18n.t(
        'screens:deliver.customerIssue.list.dateNrReplies',
        {
          date: date,
          nr: item.driverResponses.length,
          interpolation: { escapeValue: false }
        }
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

    if (new Date(date).valueOf() > new Date().valueOf() - 24 * 60 * 60 * 1000) {
      date = new Date(item.claimDateTime).toLocaleString('en-UK', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      tempItem.miscelaneousSmall = I18n.t(
        'screens:deliver.customerIssue.list.dateNrReplies',
        {
          date: date,
          nr: item.driverResponses.length
        }
      );

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
