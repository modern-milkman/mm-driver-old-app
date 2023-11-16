import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as inAppBrowserActions } from 'Reducers/inappbrowser';
import {
  Creators as deliveryActions,
  checklist as checklistSelector
} from 'Reducers/delivery';

import EmptiesCollected from './view';

export default connect(
  state => {
    const checklist = checklistSelector(state);

    return {
      payload: checklist?.payload,
      processing: state.delivery?.processing,
      emptiesRequired: checklist?.emptiesRequired,
      emptiesScreenDirty: checklist?.emptiesScreenDirty,
      ...state.transient
    };
  },
  {
    saveVehicleChecks: deliveryActions.saveVehicleChecks,
    setEmpty: deliveryActions.setEmpty,
    showMustComplyWithTerms: deliveryActions.showMustComplyWithTerms,
    updateChecklistProps: deliveryActions.updateChecklistProps,
    updateInAppBrowserProps: inAppBrowserActions.updateProps,
    updateTransientProps: transientActions.updateProps
  }
)(EmptiesCollected);
