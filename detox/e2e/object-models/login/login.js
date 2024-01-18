/*global device element waitFor by expect */
import { join, resolve } from 'path';
import { Config } from '../../../utilities/config/config';
import { Database } from '../../../utilities/sql/database';
import { regions } from '../../../utilities/regions';

export class LoginPage {
  static currentUser = {};
  passwordField = element(
    by
      .type('android.widget.EditText')
      .withAncestor(by.id('home-password-input'))
  );

  emailField = element(
    by.type('android.widget.EditText').withAncestor(by.id('home-email-input'))
  );

  loginBtn = element(by.text('Login'));

  emailError = element(by.text('Email is invalid'));

  versionNumber = element(by.type('android.widget.TextView')).atIndex(0);

  rememberMe = element(
    by.type('com.facebook.react.views.switchview.ReactSwitch')
  ).atIndex(0);

  regionSelector = (text = 'UK') => element(by.text(text));
  regionValue = element(by.id('home-region-selector-value'));

  franceOption = element(by.text('France'));
  ukOption = element(by.text('UK'));
  cancelOption = element(by.text('Cancel'));

  async selectRegion(region, textValue) {
    await this.emailField.tap();
    await device.pressBack();
    const option = region === regions.uk ? this.ukOption : this.franceOption;
    await new Promise(res => {
      setTimeout(async () => {
        try {
          await this.regionSelector().tap();
          res();
        } catch {
          setTimeout(async () => {
            try {
              await element(by.id('home-region-selector')).tap();
              res();
            } catch {
              await this.regionSelector('FRANCE').tap();
              res();
            }
          }, 1000);
        }
      }, 1000);
    });
    await expect(option).toBeVisible();
    await option.tap();
    await expect(this.regionValue).toHaveText(textValue);
  }

  loginWithCredentials = async (username, password) => {
    await waitFor(this.emailField).toBeVisible().withTimeout(5000);
    await waitFor(this.passwordField).toBeVisible().withTimeout(5000);

    await this.emailField.tap();
    await this.emailField.replaceText(username);
    await this.passwordField.replaceText(password);
    await this.passwordField.scrollTo('bottom');
    await device.pressBack();
    await this.loginBtn.tap();
  };

  async loginWithValidCredentials(
    region = regions.uk,
    script = 'getUser',
    defaultUser = false
  ) {
    const { env } = Config.config;

    let credentials = null;
    if (defaultUser) {
      credentials = {
        email: env.defaultUser,
        password: env.defaultPassword
      };
    } else {
      const db = Database.fromRegion(region);

      var result = await db.runFromFile(
        resolve(join(__dirname, 'queries', `${script}.sql`))
      );

      const user = JSON.parse(JSON.stringify(result.recordset.pop()));
      LoginPage.currentUser = user;

      credentials = {
        email: user.email,
        password: env.defaultPassword
      };
    }

    await this.loginWithCredentials(credentials.email, credentials.password);
  }
}
