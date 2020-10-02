import { createActions, createReducer } from 'reduxsauce';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    getDriver: null,
    setDriver: ['payload'],
    updateProps: ['props']
  },
  { prefix: 'user/' }
);

const initialState = {};

export const reset = () => initialState;

export const setDriver = (state, { payload }) =>
  produce(state, (draft) => {
    draft = { ...state, ...payload };
    return draft;
  });

export default createReducer(initialState, {
  [Types.SET_DRIVER]: setDriver,
  [Types.UPDATE_PROPS]: updateProps
});

export const name = (state) => state.user.name;
export const user = (state) => state.user;
