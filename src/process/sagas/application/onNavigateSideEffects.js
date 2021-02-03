import { put, select } from 'redux-saga/effects';
import { InteractionManager, Platform } from 'react-native';

import Api from 'Api';
import store from 'Redux/store';
import { Types as DeviceTypes } from 'Reducers/device';
import { blacklists, deliveryStates as DS } from 'Helpers';
import { Creators as TransientCreators } from 'Reducers/transient';
import {
  checklist as checklistSelector,
  Types as DeliveryTypes
} from 'Reducers/delivery';
import {
  Types as ApplicationTypes,
  lastRoute as lastRouteSelector
} from 'Reducers/application';

export function* onNavigateSideEffects(navigateParams) {
  // type, routeName, params, action
  const { routeName, params = { refresh: true, index: null } } = navigateParams;
  const lastRoute = yield select(lastRouteSelector);
  const checklist = yield select(checklistSelector);

  if (routeName && !blacklists.addToStackRoute.includes(routeName)) {
    yield put({ type: ApplicationTypes.ADD_TO_STACK_ROUTE, routeName, params });
  }
  if (routeName && blacklists.resetStackRoutes.includes(routeName)) {
    yield put({ type: ApplicationTypes.RESET_STACK_ROUTE, routeName });
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
      if (!checklist.loadedVan) {
        yield put({
          type: DeliveryTypes.UPDATE_PROPS,
          props: { status: DS.LV }
        });
      }
      break;

    case 'RegistrationMileage':
      if (!checklist.payloadAltered) {
        yield put({
          type: DeliveryTypes.UPDATE_PROPS,
          props: { status: checklist.shiftStartVanChecks ? DS.SEC : DS.SSC }
        });
        yield put({
          type: DeliveryTypes.RESET_CHECKLIST_PAYLOAD,
          resetType: checklist.shiftStartVanChecks ? 'shiftEnd' : 'shiftStart'
        });
      }
  }

  if (routeName && !blacklists.transientReset.includes(routeName)) {
    InteractionManager.runAfterInteractions(() => {
      const { dispatch } = store().store;
      dispatch(TransientCreators.reset());
    });
  }
}
