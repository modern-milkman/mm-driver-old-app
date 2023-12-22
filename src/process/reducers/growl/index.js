import { createActions, createReducer } from 'reduxsauce';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    updateProps: ['props'],
    alert: ['props']
  },
  { prefix: 'growl/' }
);

const initialState = {
  dropdownAlertInstance: null,
  type: 'info'
};

export const alert = (state, action) =>
  produce(state, draft => {
    draft.type = action.props.type;
  });

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps,
  [Types.ALERT]: alert
});

export const dropdownAlertInstance = state => state.growl.dropdownAlertInstance;
