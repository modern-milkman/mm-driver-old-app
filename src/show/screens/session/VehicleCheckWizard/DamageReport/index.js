import { connect } from 'react-redux';

import { Creators as deliveryActions, checklist } from 'Reducers/delivery';

import DamageReport from './view';

export default connect(
  state => ({
    payload: checklist(state)?.payload
  }),
  {
    deleteVanDamageImage: deliveryActions.deleteVanDamageImage,
    setVanDamageComment: deliveryActions.setVanDamageComment,
    setVanDamageImage: deliveryActions.setVanDamageImage
  }
)(DamageReport);
