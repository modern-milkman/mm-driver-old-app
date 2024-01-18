/*global describe beforeAll device expect it */
/*eslint no-undef: ["error", { "typeof": true }] */
import { Config } from '../utilities/config/config';
import { elementIsVisible } from '../utilities/assertions/isVisible';
import { LoginPage } from './object-models/login/login';
import { MainPage } from './object-models/main';
import { regions } from '../utilities/regions';

describe(':android: Settings', () => {
  const login = new LoginPage();

  beforeAll(async () => {
    Config.openConfig();

    await device.launchApp({
      launchArgs: {
        detoxURLBlacklistRegex: '\\("https://api.amplitude.com/2/httpapi"\\)'
      }
    });
  });

  it(':UK: I should be able to reach the settings page', async () => {
    await expect(login.emailField).toBeVisible();
    const main = new MainPage();

    await login.selectRegion(regions.uk, 'UK');
    await login.loginWithValidCredentials(regions.uk);

    await main.handleRouteDataFailed();

    if (await elementIsVisible(main.deliveriesText)) {
      await main.sidebarBtn(2).tap();
    } else {
      await main.sidebarBtn().tap();
    }

    await main.sidebar.settingsBtn.tap();
    await expect(main.settings.title).toBeVisible();
  });
});
