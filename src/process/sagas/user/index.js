import { put } from 'redux-saga/effects';

import Api from 'Api';
import { Types as UserTypes } from 'Reducers/user';

// EXPORTED
export const getId = function* () {
  yield put({
    type: Api.API_CALL,
    actions: {
      success: { type: UserTypes.SET_ID }
    },
    promise: Api.repositories.user.getId()
  });
};
