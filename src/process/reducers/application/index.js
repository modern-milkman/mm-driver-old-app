import { createActions, createReducer } from 'reduxsauce';

import { blacklists } from 'Helpers';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    addToStackRoute: ['routeName', 'params'],
    biometricLogin: null,
    biometricDisable: null,
    dismissKeyboard: null,
    getTerms: null,
    init: null,
    login: ['isBiometricLogin'],
    login_completed: null,
    login_error: ['payload', 'isBiometricLogin'],
    login_success: ['payload', 'isBiometricLogin'],
    logout: null,
    mounted: null,
    navigate: null,
    navigateBack: null,
    recoveringFromCrash: null,
    rehydrated: null,
    rehydratedAndMounted: null,
    removeLastStackRoute: null,
    resetAndReload: null,
    resetStackRoute: ['routeName'],
    sendCrashLog: ['payload'],
    updateProps: ['props'],
    verifyAutomatedLoginOrLogout: null
  },
  { prefix: 'application/' }
);

const initialState = {
  lastRouteParams: null,
  mounted: false,
  processing: false,
  rehydrated: false,
  stackRoute: ['Home'],
  userSessionPresent: false
};

const resetStackDepthRoutes = [];

export const addToStackRoute = (state = initialState, action) =>
  produce(state, draft => {
    const { routeName, params } = action;
    if (!blacklists.addToStackRoute.includes(routeName)) {
      if (draft.stackRoute[draft.stackRoute.length - 1] !== routeName) {
        if (resetStackDepthRoutes.includes(routeName)) {
          draft.stackRoute = [routeName];
        } else {
          draft.stackRoute.push(routeName);
        }
      }
      if (params) {
        draft.lastRouteParams = params;
      }
    }
  });

export const loginError = (state = initialState) =>
  produce(state, draft => {
    draft.userSessionPresent = false;
    draft.processing = false;
  });

export const loginSuccess = (state = initialState) =>
  produce(state, draft => {
    draft.userSessionPresent = true;
  });

export const processingOn = (state = initialState) =>
  updateProps(state, { props: { processing: true } });

export const rehydratedAndMounted = (state = initialState) =>
  produce(state, draft => {
    draft.rehydrated = true;
  });

export const removeLastStackRoute = (state = initialState) =>
  produce(state, draft => {
    draft.stackRoute.splice(-1, 1);
  });

export const resetStackRoute = (state = initialState, { routeName }) =>
  produce(state, draft => {
    if (draft.stackRoute.indexOf(routeName) + 1 < draft.stackRoute.length) {
      draft.stackRoute.splice(draft.stackRoute.indexOf(routeName) + 1);
    }
  });

export default createReducer(initialState, {
  [Types.ADD_TO_STACK_ROUTE]: addToStackRoute,
  [Types.BIOMETRIC_LOGIN]: processingOn,
  [Types.LOGIN]: processingOn,
  [Types.LOGIN_ERROR]: loginError,
  [Types.LOGIN_SUCCESS]: loginSuccess,
  [Types.REMOVE_LAST_STACK_ROUTE]: removeLastStackRoute,
  [Types.RESET_STACK_ROUTE]: resetStackRoute,
  [Types.REHYDRATED_AND_MOUNTED]: rehydratedAndMounted,
  [Types.UPDATE_PROPS]: updateProps
});

export const lastRoute = state =>
  state.application.stackRoute[state.application.stackRoute.length - 1];
export const lastRouteParams = state => state.application.lastRouteParams;
export const mounted = state => state.application.mounted;
export const userSessionPresent = state => state.application.userSessionPresent;
export const rehydrated = state => state.application.rehydrated;
