import { createActions, createReducer } from 'reduxsauce';

import { updateProps } from '../shared';

export const { Types, Creators } = createActions(
  {
    addToStackRoute: ['routeName', 'params'],
    dismissKeyboard: null,
    init: null,
    navigate: null,
    navigateBack: null,
    rehydrated: null,
    updateProps: ['props'],
    removeLastStackRoute: null
  },
  { prefix: 'application/' }
);

const initialState = {
  stackRoute: ['Home'],
  lastRouteParams: null
};

const resetStackDepthRoutes = [];

export const addToStackRoute = (state, action) => {
  const { routeName, params } = action;
  let stack = state.stackRoute;
  let lastRouteParams = null;

  if (params) {
    lastRouteParams = params;
  }

  if (state.stackRoute[state.stackRoute.length - 1] !== routeName) {
    if (resetStackDepthRoutes.includes(routeName)) {
      stack = [routeName];
    } else {
      stack = state.stackRoute.concat(routeName);
    }
  }

  return {
    ...state,
    stackRoute: stack,
    lastRouteParams
  };
};

export const removeLastStackRoute = (state) => ({
  ...state,
  stackRoute: state.stackRoute.slice(0, -1)
});

export default createReducer(initialState, {
  [Types.ADD_TO_STACK_ROUTE]: addToStackRoute,
  [Types.REMOVE_LAST_STACK_ROUTE]: removeLastStackRoute,
  [Types.UPDATE_PROPS]: updateProps
});

export const lastRoute = (state) =>
  state.application.stackRoute[state.application.stackRoute.length - 1];
export const lastRouteParams = (state) => state.application.lastRouteParams;
