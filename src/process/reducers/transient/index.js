import { createActions, createReducer } from 'reduxsauce';

import validations from './validations';

import { produce } from '../shared';

export const { Types, Creators } = createActions(
  {
    reset: null,
    updateProps: ['props']
  },
  { prefix: 'transient/' }
);

const initialState = {};

export const reset = (state) =>
  produce(state, (draft) => {
    draft = { ...initialState };
  });

export const updateProps = (state, { props }) => {
  return produce(state, (draft) => {
    for (const [prop, value] of Object.entries(props)) {
      draft[prop] = value;
      if (validations[prop]) {
        if (validations[prop].isValid(value)) {
          draft[`${prop}HasError`] = false;
          draft[`${prop}ErrorMessage`] = '';
        } else {
          draft[`${prop}HasError`] = true;
          draft[`${prop}ErrorMessage`] = validations[prop].message;
        }
      }
    }
  });
};

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps,
  [Types.RESET]: reset
});

export const transient = (state) => ({ ...state.transient });
