/*global element by waitFor */
import { PageObjectModel } from '../../../utilities/page-object-model';
import { regions } from '../../../utilities/regions';
import { Database } from '../../../utilities/sql/database';
import { Parameter } from '../../../utilities/sql/mssql-parameter';
import { LoginPage } from '../login/login';
import { join, resolve } from 'path';

export class OrderDetails extends PageObjectModel {
  skipBtn = element(by.id('deliver-skip'));
  modalReasonType = element(by.id('modal-reason-type'));
  modalReasonInput = element(
    by.type('android.widget.TextView').withAncestor(by.id('modal-reason-input'))
  );
  modalCancelBtn = element(by.id('modal-cancel-btn'));
  modalSkipBtn = element(by.id('modal-skip-btn'));

  proveDeliveryBtn = (idx = 0, hasPhoto = false) =>
    !hasPhoto
      ? element(
          by
            .type('com.horcrux.svg.SvgView')
            .withAncestor(by.id('delivery-actions-view'))
        ).atIndex(idx)
      : element(
          by
            .id('deliver-prove-btn')
            .withAncestor(by.id('delivery-actions-view'))
        ).atIndex(idx);
  //: 'com.horcrux.svg.ImageView'
  deliverDoneBtn = element(by.id('deliver-done-btn'));

  orderItem = productId =>
    element(by.id(`deliver-deliveryItemRow-${productId}`));
  // element(by.id(`deliver-deliveryItemRow-${productId}`));

  emptiesCollectedYesBtn = element(by.text('YES'));
  takePhotoBtn = element(by.text('Take a Photo'));
  chooseGalleryBtn = element(by.text('Choose from Gallery'));
  deletePhotoBtn = element(by.text('Delete Photo'));
  itemList = element(by.id('deliver-order-items'));

  async getOrderDetails(
    customerId,
    region = regions.uk,
    script = 'getOrderDetails'
  ) {
    const db = Database.fromRegion(region);

    var result = await db.runFromFile(
      resolve(join(__dirname, 'queries', `${script}.sql`)),
      [
        new Parameter('DriverId', LoginPage.currentUser.driverID, 'Int'),
        new Parameter('CustomerId', customerId, 'Int')
      ]
    );

    const records = JSON.parse(JSON.stringify(result.recordset));
    return records;
  }

  async tapAllOrderItems(orderItems) {
    let maxIndex = orderItems.length - 1;
    for (let x = 0; x < maxIndex + 1; x++) {
      const item = this.orderItem(orderItems[x].productId);
      try {
        await waitFor(item).toBeVisible(1000);
      } catch (e) {}
      try {
        await item.tap();
        orderItems.splice(x, 1);
        x--;
        maxIndex--;
      } catch (e) {}
    }
    try {
      await this.itemList.scroll(100, 'down');
    } catch (e) {}
  }
}
