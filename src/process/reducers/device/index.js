import { createActions, createReducer } from 'reduxsauce';

import { updateProps } from '../shared';

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
  uniqueID: 'uninitialized'
};

export const setLocation = (state, action) => {
  const locationValidated =
    !isNaN(parseFloat(action.position.coords.latitude)) &&
    !isNaN(parseFloat(action.position.coords.longitude));
  if (locationValidated) {
    return {
      ...state,
      position: action.position
    };
  } else {
    return { ...state };
  }
};

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps,
  [Types.SET_LOCATION]: setLocation
});

export const device = (state) => state.device;
