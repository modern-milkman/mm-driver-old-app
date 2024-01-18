import { connect } from 'react-redux';

import {
  additionalItemCount,
  barcodeItemCount,
  itemCount,
  loadedVanItems,
  TPLItemCount,
  Creators as deliveryActions
} from 'Reducers/delivery';

import LoadVan from './view';

export default connect(
  state => ({
    additionalItemCount: additionalItemCount(state),
    barcodeItemCount: barcodeItemCount(state),
    itemCount: itemCount(state),
    deliveredStock: state.delivery?.deliveredStock,
    loadedVanItems: loadedVanItems(state),
    orderedStock: state.delivery?.orderedStock,
    readOnly: state.application.lastRouteParams?.readOnly,
    TPLItemCount: TPLItemCount(state),
    type: state.application.lastRouteParams?.type
  }),
  {
    scanBarcodeError: deliveryActions.scanBarcodeError,
    updateChecklistProps: deliveryActions.updateChecklistProps
  }
)(LoadVan);
