import { Platform } from 'react-native';

import { appVersionString } from 'Helpers';

export default {
  context: () => ({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `*${appVersionString({ diagnostics: true })}* on ${Platform.OS} ${
          Platform.Version
        }`
      }
    ]
  }),
  crash: crash => ({
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `\`\`\`${JSON.stringify(crash, null, 2)}\`\`\``
      }
    ]
  }),
  divider: {
    type: 'divider'
  },
  driverInfo: ({
    completedStops,
    driverId,
    failedItems,
    itemCount,
    requestQueues,
    routeId,
    stopCount
  }) => ({
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `*Driver id:* ${driverId}`
      },
      {
        type: 'mrkdwn',
        text: `*Route id:* ${routeId}`
      },
      {
        type: 'mrkdwn',
        text: `*Received stops:* ${stopCount}`
      },
      {
        type: 'mrkdwn',
        text: `*Received stock:* ${itemCount}`
      },
      {
        type: 'mrkdwn',
        text: `*Completed stops:* ${completedStops}`
      },
      {
        type: 'mrkdwn',
        text: `*Failed items:* ${failedItems}`
      },
      {
        type: 'mrkdwn',
        text: `*Offline requests:* ${requestQueues.offline.length}`
      },
      {
        type: 'mrkdwn',
        text: `*Failed requests:* ${requestQueues.failed.length}`
      }
    ]
  }),
  header: text => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${text}*`
    }
  }),
  requestSection: ({ body, datetime, path, status }) => {
    const section = {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*${status}* ${path}`
        },
        {
          type: 'plain_text',
          text: new Date(datetime).toLocaleString('en-GB')
        }
      ]
    };
    if (body) {
      const filteredBody = { ...body };
      if (filteredBody.proofOfDelivery) {
        // /delivery/v1/api/Delivery/${orderId}/SetDelivered
        filteredBody.proofOfDelivery = true;
      }
      if (filteredBody.image) {
        // /Claim/DriverResponse
        filteredBody.image = true;
      }

      section.fields.push({
        type: 'mrkdwn',
        text: `\`\`\`${JSON.stringify(filteredBody)}\`\`\``
      });
    }
    return section;
  },
  title: text => ({
    type: 'header',
    text: {
      type: 'plain_text',
      text,
      emoji: true
    }
  })
};
