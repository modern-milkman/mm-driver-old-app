/*global element by */
export class SettingsPage {
  title = element(by.id('settings-title-nav'));
  logoutBtn = element(by.id('settings-logout-button'));
  confirmLogoutBtn = element(by.text('LOGOUT'));
}
