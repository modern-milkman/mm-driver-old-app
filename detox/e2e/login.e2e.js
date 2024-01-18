/*global describe beforeAll device expect it waitFor */
/*eslint no-undef: ["error", { "typeof": true }] */
import { Config } from '../utilities/config/config';
import { LoginPage } from './object-models/login/login';
import { MainPage } from './object-models/main/main';
import { regions } from '../utilities/regions';

describe(':android: Login', () => {
  const login = new LoginPage();

  beforeAll(async () => {
    Config.openConfig();

    await device.launchApp({
      launchArgs: {
        newInstance: true,
        detoxURLBlacklistRegex: '\\("https://api.amplitude.com/2/httpapi"\\)'
      }
    });

    await device.setLocation(
      Config.config.defaultLat,
      Config.config.defaultLong
    );
  }, 2000000);

  it('should display the expected fields', async () => {
    await expect(login.passwordField).toBeVisible();
    await expect(login.emailField).toBeVisible();
  });

  [
    { email: 'test-user', password: '123' },
    { email: 'test-user@example', password: '123' },
    { email: 'test-user@example.', password: '123' }
  ].forEach(async itm => {
    it(`should pick up '${itm.email}' as an invalid email`, async () => {
      // const passwordField = element(by.type('android.widget.EditText')).atIndex(0);
      await waitFor(login.emailField).toBeVisible().withTimeout(5000);
      await waitFor(login.passwordField).toBeVisible().withTimeout(5000);

      await login.emailField.tap();
      await login.emailField.replaceText(itm.email);
      await login.passwordField.replaceText(itm.password);
      await login.passwordField.scrollTo('bottom');
      await device.pressBack();

      await login.loginBtn.tap();

      await waitFor(login.emailError).toBeVisible().withTimeout(2500);
    });
  });

  // deepcode ignore NoHardcodedPasswords: intentionally incorrect passwords
  [
    { email: 'a@a1.com', password: 'asdfgh' },
    { email: 'a@a2.com', password: 'asdfgh' },
    { email: 'a@a3.com', password: 'asdfgh' },
    { email: 'a@a4.com', password: 'asdfgh' }
  ].forEach(async itm => {
    it(`should not allow me to log in with invalid credentials for '${itm.email}'`, async () => {
      await login.loginWithCredentials(itm.email, itm.password);

      await expect(login.passwordField).toBeVisible();
      await expect(login.emailField).toBeVisible();
    });
  });

  [
    { region: regions.france, textValue: 'FRANCE' },
    { region: regions.uk, textValue: 'UK' }
  ].forEach(async itm => {
    it(`should allow me to switch to the ${itm.textValue} region`, async () => {
      await login.selectRegion(itm.region, itm.textValue);

      try {
        await this.regionSelector().tap();
      } catch {
        await this.regionSelector('FRANCE').tap();
      }

      await login.cancelOption.tap();
      await expect(login.regionValue).toHaveText(itm.textValue);
    });

    it(`:${itm.textValue}: should login with valid credentials`, async () => {
      const main = new MainPage();

      await login.selectRegion(itm.region, itm.textValue);
      await login.loginWithValidCredentials(itm.region);

      await waitFor(main.checkInBtn).toBeVisible().withTimeout(30000);

      await main.handleRouteDataFailed();
      await main.logOut();
    });
  });
});
