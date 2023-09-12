import { createActions, createReducer } from 'reduxsauce';

import { updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    updateProps: ['props']
  },
  { prefix: 'inappbrowser/' }
);

const initialState = {
  canGoBack: false,
  canGoForward: false,
  html: null,
  showAddressBar: true,
  url: null,
  visible: false
};

export default createReducer(initialState, {
  [Types.UPDATE_PROPS]: updateProps
});
