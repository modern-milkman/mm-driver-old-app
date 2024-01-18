/*global element by */

export class CheckVan {
  registration = element(
    by
      .type('android.widget.EditText')
      .withAncestor(by.id('checkVan-registration-input'))
  );

  mileage = element(
    by
      .type('android.widget.EditText')
      .withAncestor(by.id('checkVan-mileage-input'))
  );

  next = element(by.id('checkVan-next-btn'));
  scrollView = element(by.id('checkVan-scroll-view'));
}
