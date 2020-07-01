import { createActions, createReducer } from 'reduxsauce';

import { updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    updateProps: ['props']
  },
  { prefix: 'actionsheetandroid/' }
);

const initialState = {
  options: {},
  optionKeys: [],
  visible: false
};

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps
});
