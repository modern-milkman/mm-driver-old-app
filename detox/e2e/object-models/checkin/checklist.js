/*global element by */
import { CheckVan } from './checkVan';
import { EmptiesCollected } from './emptiesCollected';
import { LoadVan } from './loadVan';

export class CheckInCheckList {
  navBtn = (idx = 1) =>
    element(by.type('android.widget.TextView')).atIndex(idx);

  checkInBtn = element(by.id('checkIn-checkVan-listItem'));
  checkIn = new CheckVan();
  empties = new EmptiesCollected();

  loadVanBtn = element(by.id('checkIn-loadVan-listItem'));
  loadVan = new LoadVan();

  deliverProductsBtn = element(by.id('checkIn-deliverProducts-listItem'));
  checkVanEndBtn = element(by.id('checkIn-checkVanEnd-listItem'));
  checkOutBtn = element(by.id('checkIn-checkOut-listItem'));
}
