import { connect } from 'react-redux';

import {
  additionalItemCount,
  itemCount,
  loadedVanItems,
  Creators as deliveryActions
} from 'Reducers/delivery';

import LoadVan from './view';

export default connect(
  state => ({
    additionalItemCount: additionalItemCount(state),
    itemCount: itemCount(state),
    deliveredStock: state.delivery?.deliveredStock,
    loadedVanItems: loadedVanItems(state),
    orderedStock: state.delivery?.orderedStock,
    readOnly: state.application.lastRouteParams?.readOnly
  }),
  {
    updateChecklistProps: deliveryActions.updateChecklistProps,
    updateDriverActivity: deliveryActions.updateDriverActivity
  }
)(LoadVan);
