import { put, select } from 'redux-saga/effects';

import Api from 'Api';
import { user as userSelector } from 'Reducers/user';
import { Types as TransientTypes } from 'Reducers/transient';
import {
  Types as ApplicationTypes,
  lastRoute as lastRouteSelector
} from 'Reducers/application';

export function* onNavigateSideEffects(navigateParams) {
  // type, routeName, params, action
  const { routeName, params = { refresh: true, index: null } } = navigateParams;
  const lastRoute = yield select(lastRouteSelector);
  const user = yield select(userSelector);

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

    case 'LoadVan':
      yield put({
        type: Api.API_CALL,
        promise: Api.repositories.fleet.drivers({
          id: `${user.id}`,
          deliveryStatus: 'LOADING_VAN'
        })
      });
      break;
  }

  yield put({ type: TransientTypes.RESET });
}
