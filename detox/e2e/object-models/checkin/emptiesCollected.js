/*global element by */
import { PageObjectModel } from '../../../utilities/page-object-model';

export class EmptiesCollected extends PageObjectModel {
  scrollView = element(by.id('empties-scroll-view'));
  emptiesField = idx =>
    element(
      by
        .type('android.widget.EditText')
        .withAncestor(by.id(`empties-textInput-${idx}`))
    );

  next = element(by.id('empties-mainNext-btn'));
  error = element(
    by.text('You need to comply with all terms to start your shift')
  );
}
