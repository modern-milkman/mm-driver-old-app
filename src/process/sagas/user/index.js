import { put } from 'redux-saga/effects';

import Api from 'Api';
import { Types as UserTypes } from 'Reducers/user';
import Analytics, { EVENTS } from 'Services/analytics';
import { Types as ApplicationTypes } from 'Reducers/application';
import { Types as DeliveryTypes } from 'Reducers/delivery';

// EXPORTED
export const getDriver = function* ({ isBiometricLogin = false }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      fail: { type: ApplicationTypes.LOGIN_ERROR },
      success: { type: UserTypes.SET_DRIVER }
    },
    promise: Api.repositories.user.getDriver(),
    isBiometricLogin
  });
  Analytics.trackEvent(EVENTS.GET_DRIVER_DATA);
};

export const setDriver = function* ({ payload }) {
  yield put({
    type: DeliveryTypes.UPDATE_PROPS,
    props: { userId: payload.userId }
  });
  yield put({ type: DeliveryTypes.INIT_CHECKLIST });
};
