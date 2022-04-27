import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as inAppBrowserActions } from 'Reducers/inappbrowser';
import { Creators as deliveryActions, checklist } from 'Reducers/delivery';

import EmptiesCollected from './view';

export default connect(
  state => ({
    payload: checklist(state)?.payload,
    processing: state.delivery?.processing,
    ...state.transient
  }),
  {
    saveVehicleChecks: deliveryActions.saveVehicleChecks,
    setEmpty: deliveryActions.setEmpty,
    showMustComplyWithTerms: deliveryActions.showMustComplyWithTerms,
    updateChecklistProps: deliveryActions.updateChecklistProps,
    updateInAppBrowserProps: inAppBrowserActions.updateProps,
    updateTransientProps: transientActions.updateProps
  }
)(EmptiesCollected);
