import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Config from 'react-native-config';
import { ActivityIndicator } from 'react-native';

import I18n from 'Locales/I18n';
import { colors, defaults } from 'Theme';
import NavigationService from 'Services/navigation';
import { ColumnView, RowView, SafeAreaView } from 'Containers';
import { Button, ListHeader, NavBar, ProgressBar, Text } from 'Components';

let reportsTimer = null;

const startTimer = setProcessing => {
  if (setProcessing) {
    reportsTimer = setTimeout(
      setProcessing.bind(null, false),
      parseInt(Config.API_TIMEOUT)
    );
  }
};

const clearTimer = setProcessing => {
  clearTimeout(reportsTimer);
};

const renderFailedRequests = ({
  processing,
  syncingData,
  shareOfflineData
}) => (
  <>
    <ListHeader title={I18n.t('screens:reports.sections.failed')} />
    <ColumnView
      width={'auto'}
      alignItems={'flex-start'}
      marginHorizontal={defaults.marginHorizontal}
      marginVertical={defaults.marginVertical / 2}>
      <Text.List color={colors.error}>
        {I18n.t('screens:reports.failed.hasData')}
      </Text.List>
    </ColumnView>
    <RowView
      width={'auto'}
      marginHorizontal={defaults.marginHorizontal}
      marginVertical={defaults.marginVertical / 2}>
      <Button.Primary
        title={I18n.t('screens:reports.buttons.sendToSuper')}
        onPress={shareOfflineData}
        disabled={syncingData || processing}
      />
    </RowView>
  </>
);

const renderOfflineData = ({
  processing,
  requestQueues,
  syncOffline,
  syncingData
}) => (
  <ColumnView
    marginHorizontal={defaults.marginHorizontal}
    justifyContent={'space-between'}
    alignItems={'flex-start'}
    marginVertical={defaults.marginVertical / 2}
    width={'auto'}>
    <Text.List color={colors.secondary}>
      {requestQueues.offline.length === 0
        ? I18n.t('screens:reports.offline.noData')
        : I18n.t('screens:reports.offline.hasData', {
            requests: requestQueues.offline.length
          })}
    </Text.List>
    {requestQueues.offline.length > 0 &&
      renderReconnectAndSyncButton({ processing, syncOffline, syncingData })}
  </ColumnView>
);

const renderReconnectAndSyncButton = ({
  processing,
  syncOffline,
  syncingData
}) => (
  <RowView width={'auto'} marginVertical={defaults.marginVertical / 2}>
    <Button.Primary
      title={I18n.t('screens:reports.buttons.reconnectAndSync')}
      onPress={syncOffline}
      processing={syncingData}
      disabled={syncingData || processing}
    />
  </RowView>
);

const renderSyncingData = ({
  processing,
  requestQueues,
  syncingData,
  syncOffline
}) => (
  <ColumnView
    marginHorizontal={defaults.marginHorizontal}
    justifyContent={'space-between'}
    marginVertical={defaults.marginVertical / 2}
    width={'auto'}>
    <RowView
      width={'100%'}
      justifyContent={'space-between'}
      marginVertical={defaults.marginVertical / 4}>
      <Text.List color={colors.secondary}>
        {I18n.t('screens:reports.offline.accuracy')}
      </Text.List>
      <Text.List color={colors.secondary}>
        {I18n.t('screens:reports.offline.percentage', {
          percentage: requestQueues.toSync
            ? Math.floor(
                ((requestQueues.toSync - requestQueues.offline.length) * 100) /
                  requestQueues.toSync
              )
            : 0
        })}
      </Text.List>
    </RowView>
    <RowView height={4}>
      <ProgressBar
        height={4}
        progress={
          requestQueues.toSync
            ? requestQueues.toSync - requestQueues.offline.length
            : 0
        }
        total={requestQueues.toSync}
      />
    </RowView>
    {renderReconnectAndSyncButton({ processing, syncOffline, syncingData })}
  </ColumnView>
);

const Reports = ({
  navigation,
  requestQueues,
  shareOfflineData,
  syncingData,
  syncOffline
}) => {
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const blurListener = navigation.addListener(
      'blur',
      clearTimer.bind(null, setProcessing)
    );
    const focusListener = navigation.addListener(
      'focus',
      startTimer.bind(null, setProcessing)
    );

    const unsubscribe = () => {
      blurListener();
      focusListener();
    };

    return unsubscribe;
  }, [navigation, setProcessing]);

  return (
    <SafeAreaView>
      <ColumnView
        flex={1}
        justifyContent={'flex-start'}
        alignItems={'stretch'}
        backgroundColor={colors.neutral}>
        <NavBar
          leftIcon={'chevron-left'}
          leftIconAction={NavigationService.goBack}
          title={I18n.t('routes:reports')}
          marginHorizontal={defaults.marginHorizontal / 3}
        />

        {processing && (
          <RowView marginHorizontal={defaults.marginHorizontal} width={'auto'}>
            <ColumnView
              marginRight={defaults.marginHorizontal / 2}
              width={'auto'}>
              <ActivityIndicator color={colors.primary} />
            </ColumnView>
            <Text.Caption color={colors.inputDark}>
              {I18n.t('screens:reports.generating.message')}
            </Text.Caption>
          </RowView>
        )}

        <ListHeader title={I18n.t('screens:reports.sections.offline')} />

        {syncingData
          ? renderSyncingData({
              processing,
              requestQueues,
              syncingData,
              syncOffline
            })
          : renderOfflineData({
              processing,
              requestQueues,
              syncingData,
              syncOffline
            })}

        {requestQueues.failed.length > 0 &&
          renderFailedRequests({ processing, syncingData, shareOfflineData })}
      </ColumnView>
    </SafeAreaView>
  );
};

Reports.propTypes = {
  navigation: PropTypes.object,
  requestQueues: PropTypes.object,
  shareOfflineData: PropTypes.func,
  syncingData: PropTypes.bool,
  syncOffline: PropTypes.func
};

Reports.defaultProps = {};

export default Reports;
