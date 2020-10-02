import { connect } from 'react-redux';

import { itemCount, Creators as deliveryActions } from 'Reducers/delivery';

import LoadVan from './view';

export default connect(
  (state) => ({
    itemCount: itemCount(state),
    groupedStock: state.delivery[state.delivery.currentDay]?.groupedStock
  }),
  { updateCurrentDayProps: deliveryActions.updateCurrentDayProps }
)(LoadVan);
