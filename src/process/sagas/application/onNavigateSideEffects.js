import { put, select } from 'redux-saga/effects';

import { Types as TransientTypes } from '/process/reducers/transient';
import {
  Types as ApplicationTypes,
  lastRoute as lastRouteSelector
} from '/process/reducers/application';

export function* onNavigateSideEffects(navigateParams) {
  // type, routeName, params, action
  const { routeName, params = { refresh: true, index: null } } = navigateParams;
  const lastRoute = yield select(lastRouteSelector);

  if (routeName) {
    yield put({ type: ApplicationTypes.ADD_TO_STACK_ROUTE, routeName, params });
  }

  switch (routeName) {
    case null:
      // back navigation
      switch (lastRoute) {
      }
      yield put({ type: ApplicationTypes.DISMISS_KEYBOARD });
      break;
  }

  yield put({ type: TransientTypes.RESET });
}
