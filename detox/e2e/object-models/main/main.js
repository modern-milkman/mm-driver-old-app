/*global element by expect */
import { SettingsPage } from '../settings';
import { SideBarPage } from '../sidebar';
import { Config } from '../../../utilities/config/config';
import { elementIsVisible } from '../../../utilities/assertions/isVisible';
import { LoginPage } from '../login/login';
import { CheckInCheckList } from '../checkin/checklist';
import { Database } from '../../../utilities/sql/database';
import { regions } from '../../../utilities/regions';
import { Parameter } from '../../../utilities/sql/mssql-parameter';
import { join, resolve } from 'path';
import { OrderDetails } from '../order-details/orderDetails';

export class MainPage {
  static locations = [];

  checkInBtn = element(by.id('foregroundContent-main-btn'));

  checklist = new CheckInCheckList();
  orderDetails = new OrderDetails();

  sidebarBtn = (idx = 1) =>
    element(by.type('com.horcrux.svg.SvgView')).atIndex(idx);

  navBtn = (idx = 1) =>
    element(by.type('android.widget.TextView')).atIndex(idx);

  trackLocation = element(by.id('fabs-track-location'));

  map = element(by.type('com.google.android.gms.maps.MapView')).atIndex(0);

  mapMarker = (addressId = 0) =>
    element(by.id(`map-marker-${addressId}`)).atIndex(0);

  noDelivery = element(by.text('No delivery info yet'));

  deliveriesText = element(by.id('home-deliveries-label'));
  errorAlert = element(by.text('Error getting route data'));
  text = text => element(by.text(text));

  sidebar = new SideBarPage();
  settings = new SettingsPage();

  /**
   * if get route data fails, retry until max attempts is reached
   * @param {boolean} [failTest=false] defaults to false; if set to true the test will fail, otherwise the alert message is dismissed
   * @memberof MainPage
   */
  async handleRouteDataFailed(failTest = false) {
    const maxAttempts = Config.config.maxRouteAttempts;
    let attempts = 0;

    while (
      (await elementIsVisible(this.errorAlert)) &&
      attempts < maxAttempts
    ) {
      await this.errorAlert.tap();
      attempts++;
    }

    if (await elementIsVisible(this.errorAlert)) {
      if (failTest) {
        throw new Error(
          `Getting route data failed after ${maxAttempts} attempts.`
        );
      }
      await this.errorAlert.swipe('up');
    }
  }

  async getOrderLocations(region = regions.uk, script = 'getOrderLocations') {
    const db = Database.fromRegion(region);

    var result = await db.runFromFile(
      resolve(join(__dirname, 'queries', `${script}.sql`)),
      [new Parameter('DriverId', LoginPage.currentUser.driverID, 'Int')]
    );

    const records = JSON.parse(JSON.stringify(result.recordset));
    MainPage.locations = records;
    return records;
  }

  async resetOrders(region = regions.uk, script = 'resetOrders') {
    const db = Database.fromRegion(region);

    await db.runFromFile(resolve(join(__dirname, 'queries', `${script}.sql`)), [
      new Parameter('DriverId', LoginPage.currentUser.driverID, 'Int')
    ]);
  }

  async logOut() {
    const login = new LoginPage();

    if (await elementIsVisible(login.emailField)) {
      return;
    }

    if (await elementIsVisible(this.deliveriesText)) {
      await this.sidebarBtn(2).tap();
    } else {
      await this.sidebarBtn().tap();
    }

    await this.sidebar.settingsBtn.tap();
    await this.settings.logoutBtn.tap();
    await this.settings.confirmLogoutBtn.tap();

    await expect(login.passwordField).toBeVisible();
    await expect(login.emailField).toBeVisible();
  }
}
