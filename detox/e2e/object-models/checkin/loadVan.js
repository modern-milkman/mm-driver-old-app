/*global element waitFor by */
import { join, resolve } from 'path';
import { Database } from '../../../utilities/sql/database';
import { regions } from '../../../utilities/regions';
import { PageObjectModel } from '../../../utilities/page-object-model';
import { Parameter } from '../../../utilities/sql/mssql-parameter';
import { LoginPage } from '../login/login';

export class LoadVan extends PageObjectModel {
  static deliveries = [];

  table = element(by.id('loadVan-products-view'));
  product = productId => element(by.id(`loadVan-product-${productId}`));
  doneBtn = element(by.text('DONE'));

  async getDeliveriesForDriver(
    region = regions.uk,
    script = 'getDeliveriesForDriver'
  ) {
    const db = Database.fromRegion(region);

    var result = await db.runFromFile(
      resolve(join(__dirname, 'queries', `${script}.sql`)),
      [new Parameter('DriverId', LoginPage.currentUser.driverID, 'Int')]
    );

    const records = JSON.parse(JSON.stringify(result.recordset));
    LoadVan.deliveries = records;
    return records;
  }

  async tapAllVisibleProducts(deliveries) {
    let maxIndex = deliveries.length - 1;
    for (let x = 0; x < maxIndex + 1; x++) {
      const product = this.product(deliveries[x].productId);
      try {
        await waitFor(product).toBeVisible(1000);
      } catch (e) {}
      try {
        await product.tap();
        deliveries.splice(x, 1);
        x--;
        maxIndex--;
      } catch (e) {}
    }
    try {
      await this.table.scroll(500, 'down');
    } catch (e) {}
  }
}
