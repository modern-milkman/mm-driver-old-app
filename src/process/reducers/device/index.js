import { createActions, createReducer } from 'reduxsauce';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    requestUserLocationPermisions: null,
    setLocation: ['position'],
    updateProps: ['props']
  },
  { prefix: 'device/' }
);

const initialState = {
  position: null,
  returnPosition: null,
  uniqueID: 'uninitialized'
};

export const setLocation = (state, action) =>
  produce(state, (draft) => {
    const { position } = action;
    if (
      position &&
      !isNaN(parseFloat(position.coords.latitude)) &&
      !isNaN(parseFloat(position.coords.longitude))
    ) {
      draft.position = position;
    }
  });

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps,
  [Types.SET_LOCATION]: setLocation
});

export const device = (state) => state.device;
