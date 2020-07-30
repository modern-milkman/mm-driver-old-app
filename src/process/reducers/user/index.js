import { createActions, createReducer } from 'reduxsauce';

import { updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    updateProps: ['props']
  },
  { prefix: 'user/' }
);

const initialState = {};

export const reset = () => initialState;

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps
});

export const name = (state) => state.user.name;
export const user = (state) => state.user;
