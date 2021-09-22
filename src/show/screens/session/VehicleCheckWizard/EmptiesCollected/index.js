import { connect } from 'react-redux';

import { Creators as transientActions } from 'Reducers/transient';
import { Creators as deliveryActions, checklist } from 'Reducers/delivery';

import EmptiesCollected from './view';

export default connect(
  state => ({
    payload: checklist(state)?.payload,
    ...state.transient
  }),
  {
    setEmpty: deliveryActions.setEmpty,
    updateTransientProps: transientActions.updateProps
  }
)(EmptiesCollected);
