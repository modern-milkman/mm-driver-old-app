/*global describe beforeAll afterEach device expect it */
import { Config } from '../../utilities/config/config';
import { LoginPage } from '../object-models/login/login';
import { MainPage } from '../object-models/main/main';
import { regions } from '../../utilities/regions';

const login = new LoginPage();
const main = new MainPage();

describe(':android: Driver Deliveries - Route Optimization', () => {
  beforeAll(async () => {
    Config.openConfig();

    await device.launchApp({
      launchArgs: {
        detoxURLBlacklistRegex: '\\("https://api.amplitude.com/2/httpapi"\\)'
      }
    });
  });

  afterEach(async () => {
    await main.logOut();
  });

  [
    { region: regions.uk, textValue: 'UK' }
    // { region: regions.france, textValue: 'FRANCE' }
  ].forEach(async itm => {
    it(`:${itm.textValue}: The amount of pins should match the deliveries text`, async () => {
      await expect(login.emailField).toBeVisible();

      await login.selectRegion(itm.region, itm.textValue);
      await login.loginWithValidCredentials(
        regions.region,
        `withDeliveriesTodayFor${itm.region === regions.france ? 'Fr' : 'Uk'}`
      );
    });
  });
});
