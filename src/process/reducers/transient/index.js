import { createActions, createReducer } from 'reduxsauce';

import { standard, regex } from './validations';

import { produce } from '../shared';

export const { Types, Creators } = createActions(
  {
    reset: null,
    updateProps: ['props']
  },
  { prefix: 'transient/' }
);

const initialState = {};

export const reset = state =>
  produce(state, () => {
    return initialState;
  });

export const updateProps = (state, { props }) => {
  return produce(state, draft => {
    for (const [prop, value] of Object.entries(props)) {
      draft[prop] = value;
      let validations = [];
      if (standard[prop]) {
        validations.push(...standard[prop]);
      }
      if (regex.empties.tester.test(prop)) {
        validations.push(...regex.empties.validations);
      }
      for (const validation of validations) {
        if (validation) {
          if (validation.isValid(value)) {
            draft[`${prop}HasError`] = false;
            draft[`${prop}ErrorMessage`] = '';
          } else {
            draft[`${prop}HasError`] = true;
            draft[`${prop}ErrorMessage`] = validation.message;
            break;
          }
        }
      }
    }
  });
};

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps,
  [Types.RESET]: reset
});

export const transient = state => ({ ...state.transient });
