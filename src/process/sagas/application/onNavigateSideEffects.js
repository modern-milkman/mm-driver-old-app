import { put, select } from 'redux-saga/effects';
import { InteractionManager, Platform } from 'react-native';

import Api from 'Api';
import store from 'Redux/store';
import { user as userSelector } from 'Reducers/user';
import { Types as DeviceTypes } from 'Reducers/device';
import { Creators as TransientCreators } from 'Reducers/transient';
import {
  Types as ApplicationTypes,
  lastRoute as lastRouteSelector
} from 'Reducers/application';

const blacklist = ['CustomerIssueModal'];

export function* onNavigateSideEffects(navigateParams) {
  // type, routeName, params, action
  const { routeName, params = { refresh: true, index: null } } = navigateParams;
  const lastRoute = yield select(lastRouteSelector);
  const user = yield select(userSelector);

  if (routeName && !blacklist.includes(routeName)) {
    yield put({ type: ApplicationTypes.ADD_TO_STACK_ROUTE, routeName, params });
  }

  switch (routeName) {
    case null:
      // back navigation
      switch (lastRoute) {
      }
      yield put({ type: ApplicationTypes.DISMISS_KEYBOARD });
      break;

    case 'UpgradeApp':
      if (Platform.OS === 'android') {
        yield put({
          type: Api.API_CALL,
          actions: {
            success: { type: DeviceTypes.SET_LATEST_APP }
          },
          promise: Api.repositories.appcenter.getLatest()
        });
      }
      break;

    case 'LoadVan':
      yield put({
        type: Api.API_CALL,
        promise: Api.repositories.fleet.drivers({
          id: `${user.driverId}`,
          deliveryStatus: 'LOADING_VAN'
        })
      });
      break;
  }

  InteractionManager.runAfterInteractions(() => {
    const { dispatch } = store().store;
    dispatch(TransientCreators.reset());
  });
}
