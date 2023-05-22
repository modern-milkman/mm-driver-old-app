import Config from 'react-native-config';

import Api from 'Api';
import I18n from 'Locales/I18n';
import { slack } from 'Helpers';

const postToSlack = ({ payload, url }) => {
  return Api.post(url, `payload=${encodeURI(JSON.stringify(payload))}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export default {
  sendCrashLog({ delivery, device, error, user }) {
    const payload = { blocks: [] };
    payload.blocks.push(slack.title(error.toString()));
    payload.blocks.push(
      slack.crash({
        device: {
          crashCode: device.crashCode,
          crashCount: device.crashCount,
          lowConnection: device.lowConnection,
          network: device.network,
          position: device.position,
          uniqueID: device.uniqueID
        },
        delivery: {
          routeDescription: delivery?.stockWithData?.routeDescription
        },
        user: {
          driverId: user?.driverId,
          jwtExpiry: user?.jwtExpiry,
          refreshExpiry: user?.refreshExpiry,
          jwtTokenPresent: user?.jwtToken ? 'yes' : 'no',
          refreshTokenPresent: user?.refreshToken ? 'yes' : 'no',
          roles: user?.roles
        }
      })
    );
    payload.blocks.push(slack.context());
    payload.blocks.push(slack.divider);

    return postToSlack({ url: Config.SLACK_CRASH_WEBHOOK, payload });
  },
  sendRouteReport({
    completedStops,
    failedItems,
    itemCount,
    requestQueues,
    routeId,
    stopCount,
    user
  }) {
    const payload = { blocks: [] };
    payload.blocks.push(
      slack.title(I18n.t('slack:endOfRouteTitle', { driverId: user.driverId }))
    );
    payload.blocks.push(
      slack.driverInfo({
        completedStops,
        driverId: user.driverId,
        failedItems,
        itemCount,
        requestQueues,
        routeId,
        stopCount
      })
    );
    if (requestQueues.offline.length > 0) {
      payload.blocks.push(slack.header('Offline requests'));
      for (const request of requestQueues.offline) {
        payload.blocks.push(slack.requestSection(request));
      }
    }
    if (requestQueues.failed.length > 0) {
      payload.blocks.push(slack.header('Failed requests'));
      for (const request of requestQueues.failed) {
        payload.blocks.push(slack.requestSection(request));
      }
    }
    payload.blocks.push(slack.context());
    payload.blocks.push(slack.divider);
    return postToSlack({ url: Config.SLACK_FAILED_WEBHOOK, payload });
  }
};
