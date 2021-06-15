import { connect } from 'react-redux';

import {
  additionalItemCount,
  itemCount,
  Creators as deliveryActions
} from 'Reducers/delivery';

import LoadVan from './view';

export default connect(
  (state) => ({
    additionalItemCount: additionalItemCount(state),
    itemCount: itemCount(state),
    deliveredStock: state.delivery?.deliveredStock,
    orderedStock: state.delivery?.orderedStock,
    readOnly: state.application.lastRouteParams?.readOnly
  }),
  { updateChecklistProps: deliveryActions.updateChecklistProps }
)(LoadVan);
