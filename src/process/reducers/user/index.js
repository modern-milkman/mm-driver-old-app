import { createActions, createReducer } from 'reduxsauce';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    getId: null,
    setId: ['id'],
    updateProps: ['props']
  },
  { prefix: 'user/' }
);

const initialState = {};

export const reset = () => initialState;

export const setId = (state, { payload }) =>
  produce(state, (draft) => {
    draft.id = payload;
  });

export default createReducer(initialState, {
  [Types.SET_ID]: setId,
  [Types.UPDATE_PROPS]: updateProps
});

export const name = (state) => state.user.name;
export const user = (state) => state.user;
