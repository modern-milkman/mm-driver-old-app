import { createActions } from 'reduxsauce';
import { persistCombineReducers } from 'redux-persist';

import { actionsheetandroid, application, device } from '/process/reducers';

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
  device
});

const rootReducer = (state, action) => {
  if (action.type === 'state/RESET') {
    state = {
      ...state,
      actionsheetandroid: undefined,
      application: undefined
    };
  }
  return appReducers(state, action);
};

export default rootReducer;
