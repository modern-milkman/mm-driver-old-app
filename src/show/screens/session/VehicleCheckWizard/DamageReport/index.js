import { connect } from 'react-redux';

import { Creators as deliveryActions } from 'Reducers/delivery';

import DamageReport from './view';

export default connect(
  (state) => ({
    payload: state.delivery?.checklist.payload
  }),
  {
    deleteVanDamageImage: deliveryActions.deleteVanDamageImage,
    setVanDamageComment: deliveryActions.setVanDamageComment,
    setVanDamageImage: deliveryActions.setVanDamageImage
  }
)(DamageReport);
