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
import { initialState } from 'Reducers/delivery';

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
      delivery: {
        ...initialState,
        checklist: { ...state.delivery.checklist },
        deliveryDate: state.delivery.deliveryDate
      },
      inappbrowser: undefined,
      transient:
        {
          ...(state.device.rememberMe && {
            email: state.transient.email,
            password: state.transient.password
          })
        } || undefined,
      user: undefined
    };
  }
  return appReducers(state, action);
};

export default rootReducer;
