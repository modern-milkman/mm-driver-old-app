import { createActions } from 'reduxsauce';
import { persistCombineReducers } from 'redux-persist';

import {
  actionsheetandroid,
  application,
  delivery,
  device,
  growl,
  inappbrowser,
  transient,
  user
} from 'Reducers';

import { storeConfig } from './config';

export const { Types } = createActions(
  {
    reset: null
  },
  { prefix: 'state/' }
);

const appReducers = persistCombineReducers(storeConfig, {
  actionsheetandroid,
  application,
  delivery,
  device,
  growl,
  inappbrowser,
  transient,
  user
});

const rootReducer = (state, action) => {
  if (action.type === 'state/RESET') {
    state = {
      ...state,
      actionsheetandroid: undefined,
      application: undefined,
      delivery: undefined,
      inappbrowser: undefined,
      transient: undefined,
      user: undefined
    };
  }
  return appReducers(state, action);
};

export default rootReducer;
