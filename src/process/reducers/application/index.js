import { createActions, createReducer } from 'reduxsauce';

import { produce, updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    addToStackRoute: ['routeName', 'params'],
    dismissKeyboard: null,
    init: null,
    login: null,
    logout: null,
    login_error: ['payload'],
    login_success: ['payload'],
    navigate: null,
    navigateBack: null,
    rehydrated: null,
    updateProps: ['props'],
    removeLastStackRoute: null
  },
  { prefix: 'application/' }
);

const initialState = {
  processing: false,
  stackRoute: ['Home'],
  lastRouteParams: null
};

const resetStackDepthRoutes = [];

export const addToStackRoute = (state = initialState, action) =>
  produce(state, (draft) => {
    const { routeName, params } = action;
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
  });

export const processingOn = (state = initialState) =>
  updateProps(state, { props: { processing: true } });

export const processingOff = (state = initialState) =>
  updateProps(state, { props: { processing: false } });

export const removeLastStackRoute = (state = initialState) =>
  produce(state, (draft) => {
    draft.stackRoute.slice(0, -1);
  });

export default createReducer(initialState, {
  [Types.ADD_TO_STACK_ROUTE]: addToStackRoute,
  [Types.LOGIN]: processingOn,
  [Types.LOGIN_ERROR]: processingOff,
  [Types.LOGIN_SUCCESS]: processingOff,
  [Types.REMOVE_LAST_STACK_ROUTE]: removeLastStackRoute,
  [Types.UPDATE_PROPS]: updateProps
});

export const lastRoute = (state) =>
  state.application.stackRoute[state.application.stackRoute.length - 1];
export const lastRouteParams = (state) => state.application.lastRouteParams;
