import Api from 'Api';
import Config from 'react-native-config';

export default {
  sendCrashLog({ device, error, info, user }) {
    const payload = {
      text: `
      *${error}*
      _ENV: ${Config.ENVIRONMENT.toUpperCase()}_
      _APP_VERSION_CODE: ${Config.APP_VERSION_CODE.toUpperCase()}_
      _APP_VERSION_NAME: ${Config.APP_VERSION_NAME.toUpperCase()}_
      \`\`\`${JSON.stringify(
        {
          device: {
            lowConnection: device.lowConnection,
            network: device.network,
            position: device.position,
            uniqueID: device.uniqueID
          },
          error,
          info,
          user: {
            driverId: user?.driverId,
            jwtExpiry: user?.jwtExpiry,
            refreshExpiry: user?.refreshExpiry,
            jwtTokenPresent: user?.jwtToken ? 'yes' : 'no',
            refreshTokenPresent: user?.refreshToken ? 'yes' : 'no',
            roles: user?.roles,
            routes: user?.routes
          }
        },
        null,
        2
      )}\`\`\`
    `
    };

    return Api.post(
      `${Config.SLACK_CRASH_WEBHOOK}`,
      `payload=${encodeURI(JSON.stringify(payload))}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  }
};
