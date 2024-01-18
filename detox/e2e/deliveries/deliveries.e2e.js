/*global by describe element beforeAll afterAll afterEach device expect it waitFor */
import { Config } from '../../utilities/config/config';
import { LoginPage } from '../object-models/login/login';
import { MainPage } from '../object-models/main/main';
import { regions } from '../../utilities/regions';

const login = new LoginPage();
const main = new MainPage();
const failTestOnRouteDataError = true;

describe(':android: Driver Deliveries - Inital Screen', () => {
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

      await main.handleRouteDataFailed(failTestOnRouteDataError);
      await expect(main.noDelivery).not.toBeVisible();
      await expect(main.text(LoginPage.currentUser.routeName)).toBeVisible();
      await expect(
        main.text(`${LoginPage.currentUser.numberOfDeliveries} deliveries`)
      ).toBeVisible();
    });
  });
});

describe(':android: Driver Deliveries - e2e', () => {
  let locations = [];
  let currentDeliveries = 0;

  beforeAll(async () => {
    Config.openConfig();

    await device.launchApp({
      launchArgs: {
        detoxURLBlacklistRegex: '\\("https://api.amplitude.com/2/httpapi"\\)'
      }
    });
  });

  afterAll(async () => {
    await main.resetOrders();
  });

  it(':UK: I can click the check in button', async () => {
    await expect(login.emailField).toBeVisible();
    await login.selectRegion(regions.uk, 'UK');

    await login.loginWithValidCredentials(
      regions.uk,
      'withDeliveriesTodayForUk'
    );

    await main.handleRouteDataFailed(failTestOnRouteDataError);

    await expect(main.noDelivery).not.toBeVisible();
    await expect(main.text(LoginPage.currentUser.routeName)).toBeVisible();

    await main.checkInBtn.tap();
  });

  it(':UK: should allow me to display the checklist', async () => {
    await expect(main.text('Your Route Checklist'));

    await expect(main.checklist.checkInBtn).toBeVisible();
    await expect(main.checklist.loadVanBtn).toBeVisible();
    await expect(main.checklist.deliverProductsBtn).toBeVisible();
    await expect(main.checklist.checkVanEndBtn).toBeVisible();
    await expect(main.checklist.checkOutBtn).toBeVisible();
  });

  it(':UK: should allow me to go to the check in screen', async () => {
    await main.checklist.checkInBtn.tap();

    await expect(main.text('Registration & Mileage')).toBeVisible();
  });

  it(':UK: allows me to enter the registration & mileage', async () => {
    await main.checklist.checkIn.scrollView.scrollTo('bottom');
    await expect(main.checklist.checkIn.registration).toBeVisible();
    await expect(main.checklist.checkIn.mileage).toBeVisible();

    await main.checklist.checkIn.registration.replaceText('AB51ABC');
    await main.checklist.checkIn.mileage.replaceText('10000');

    await expect(main.checklist.checkIn.next).toBeVisible();
    await main.checklist.checkIn.next.tap();
  });

  it(':UK: should allow me to input empties', async () => {
    let maxIndex = 10;
    let maxEntryAttempts = 5;
    let attempt = 0;
    let index = 0;

    while (index !== maxIndex) {
      try {
        await main.checklist.empties.scrollView.scroll(50, 'down');
        const emptiesField = main.checklist.empties.emptiesField(index);

        try {
          await waitFor(emptiesField).toBeVisible(1000);
        } catch (e) {}

        await emptiesField.replaceText(index.toString());
        index++;
        attempt = 0;
      } catch (e) {
        if (attempt === maxEntryAttempts) {
          attempt = 0;
          index++;
        } else {
          attempt++;
        }
      }
    }
  });

  it(':UK: should require compliance with the first term', async () => {
    await main.checklist.empties.next.tap();
    await element(by.text('NO')).tap();

    await expect(main.checklist.empties.error).toBeVisible();
  });

  it(':UK: should require compliance with both terms', async () => {
    await main.checklist.empties.error.swipe('up');
    await main.checklist.empties.next.tap();
    await element(by.text('YES')).tap();
    await element(by.text('NO')).tap();
    await expect(main.checklist.empties.error).toBeVisible();
  });

  it(':UK: should allow me to continue if I comply with the terms', async () => {
    await main.checklist.empties.error.swipe('up');
    await main.checklist.empties.next.tap();
    await element(by.text('YES')).tap();
    await element(by.text('YES')).tap();
  });

  it(':UK: should allow me to view the load van page', async () => {
    const deliveries = JSON.parse(
      JSON.stringify(await main.checklist.loadVan.getDeliveriesForDriver())
    );
    await main.checklist.loadVanBtn.tap();

    const maxFails = 3;
    let previousLength = +JSON.parse(JSON.stringify(deliveries.length));
    let fails = 0;

    while (deliveries.length !== 0) {
      await main.checklist.loadVan.tapAllVisibleProducts(deliveries);

      if (deliveries.length === previousLength) {
        fails++;
      } else {
        fails = 0;
        previousLength = +JSON.parse(JSON.stringify(deliveries.length));
      }

      if (fails === maxFails - 1) {
        throw new Error(
          `Failed to tap all products after ${maxFails} attempts\r\n${JSON.stringify(
            deliveries
          )}`
        );
      }
    }

    await main.checklist.loadVan.doneBtn.tap();
  });

  it(':UK: should allow me to go back to the load van page after pressing done', async () => {
    await main.checklist.loadVanBtn.tap();
    await main.checklist.navBtn().tap();
  });

  it(':UK: should allow me to begin my round', async () => {
    await main.checklist.deliverProductsBtn.tap();
    const numberOfDeliveries = main.text(
      `/ ${LoginPage.currentUser.numberOfDeliveries}`
    );
    await expect(main.text('Deliveries')).toBeVisible();
    await expect(numberOfDeliveries).toBeVisible();
    await numberOfDeliveries.tap();
    await expect(
      main.text(`${LoginPage.currentUser.numberOfDeliveries} deliveries left`)
    ).toBeVisible();
  });

  it(':UK: should allow me to reach the delivery details', async () => {
    locations = await main.getOrderLocations();

    await device.setLocation(locations[0].latitude, locations[0].longitude);

    for (let i = 0; i < 12; i++) {
      await main.map.multiTap(2);
    }
    await main.trackLocation.tap();
    await main.navBtn(20).tap();
    const coords = {
      x: 250,
      y: 250
    };

    await main.map.tap(coords);
    await main.checkInBtn.tap();
    await expect(main.text('Details')).toBeVisible();
  });

  it(':UK: should not skip if I press cancel button', async () => {
    await main.orderDetails.skipBtn.tap();
    await main.orderDetails.modalCancelBtn.tap();
    await expect(main.text('Details')).toBeVisible();
  });

  it(':UK: should allow me to pick a reason type', async () => {
    const reasonCode = 'Wrong route';
    await main.orderDetails.skipBtn.tap();
    await main.orderDetails.modalReasonType.tap();

    await main.text(reasonCode).tap();
    await expect(main.text(reasonCode)).toBeVisible();
  });

  it(':UK: should allow me to skip a delivery', async () => {
    await main.orderDetails.modalCancelBtn.tap();
    await main.orderDetails.skipBtn.tap();
    await main.orderDetails.modalReasonType.tap();
    await main.text('Cancel').tap();
    await main.orderDetails.modalReasonInput.replaceText('Automated Test');
    await main.orderDetails.modalSkipBtn.tap();

    locations.splice(0, 1);

    currentDeliveries = LoginPage.currentUser.numberOfDeliveries - 1;

    await expect(
      main.text(`${currentDeliveries} deliveries left`)
    ).toBeVisible();
  });

  it(':UK: should not allow me to mark an order as delivered without selecting items', async () => {
    await device.setLocation(locations[0].latitude, locations[0].longitude);

    for (let i = 0; i < 12; i++) {
      await main.map.multiTap(2);
    }
    await main.trackLocation.tap();
    await main.navBtn(20).tap();
    const coords = {
      x: 250,
      y: 250
    };

    await main.map.tap(coords);
    await main.checkInBtn.tap();
    await main.orderDetails.deliverDoneBtn.tap();
    await expect(main.orderDetails.deliverDoneBtn).toBeVisible();
  });

  it(':UK: should allow me to add proof of delivery images (take a photo)', async () => {
    await main.orderDetails.emptiesCollectedYesBtn.tap();
    await main.orderDetails.proveDeliveryBtn(0).tap();
    await main.orderDetails.takePhotoBtn.tap();
    await main.orderDetails.proveDeliveryBtn(0, true).tap();
    await expect(main.orderDetails.deletePhotoBtn).toBeVisible();
    await main.orderDetails.deletePhotoBtn.tap();
  });

  it(':UK: should allow me to add proof of delivery images (choose from gallery)', async () => {
    await main.orderDetails.emptiesCollectedYesBtn.tap();
    await main.orderDetails.proveDeliveryBtn(0).tap();
    await main.orderDetails.chooseGalleryBtn.tap();
    await main.orderDetails.proveDeliveryBtn(0, true).tap();
    await expect(main.orderDetails.deletePhotoBtn).toBeVisible();
    await main.orderDetails.deletePhotoBtn.tap();
  });

  it(':UK: should allow me to mark an order as delivered', async () => {
    await main.orderDetails.emptiesCollectedYesBtn.tap();
    await main.orderDetails.proveDeliveryBtn(0).tap();
    await main.orderDetails.takePhotoBtn.tap();

    const products = await main.orderDetails.getOrderDetails(
      locations[0].customerId
    );

    const maxFails = 3;
    let previousLength = +JSON.parse(JSON.stringify(products.length));
    let fails = 0;

    while (products.length !== 0) {
      await main.orderDetails.tapAllOrderItems(products);

      if (products.length === previousLength) {
        fails++;
      } else {
        fails = 0;
        previousLength = +JSON.parse(JSON.stringify(products.length));
      }

      if (fails === maxFails - 1) {
        throw new Error(
          `Failed to tap all products after ${maxFails} attempts\r\n${JSON.stringify(
            products
          )}`
        );
      }
    }

    await main.orderDetails.deliverDoneBtn.tap();

    currentDeliveries = currentDeliveries - 1;

    await expect(
      main.text(`${currentDeliveries} deliveries left`)
    ).toBeVisible();
  });
});
