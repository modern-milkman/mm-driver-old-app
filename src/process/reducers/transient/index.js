import { createActions, createReducer } from 'reduxsauce';

import { updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    reset: null,
    updateProps: ['props']
  },
  { prefix: 'transient/' }
);

const initialState = {};

export const reset = () => initialState;

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps,
  [Types.RESET]: reset
});

export const transient = (state) => ({ ...state.transient });
