import Appcenter from 'appcenter';
import Braze from 'react-native-appboy-sdk';
import { put, select } from 'redux-saga/effects';

import Api from 'Api';
import I18n from 'Locales/I18n';
import { Types as UserTypes } from 'Reducers/user';
import NavigationService from 'Services/navigation';
import { Types as GrowlTypes } from 'Reducers/growl';
import Analytics, { EVENTS } from 'Services/analytics';
import { Types as DeliveryTypes } from 'Reducers/delivery';
import { country as countrySelector } from 'Reducers/device';
import { Types as ApplicationTypes } from 'Reducers/application';

// EXPORTED
export const acceptTerms = function* ({ minimumTermsVersion }) {
  yield put({
    type: Api.API_CALL,
    actions: {
      load: { key: 'processing ' },
      fail: { type: UserTypes.ACCEPT_TERMS_ERROR },
      success: {
        type: UserTypes.ACCEPT_TERMS_SUCCESS,
        acceptedTermsVersion: minimumTermsVersion
      }
    },
    promise: Api.repositories.user.acceptTerms()
  });
  Analytics.trackEvent(EVENTS.ACCEPT_TERMS);
};

export const acceptTermsError = function* () {
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'error',
      title: I18n.t('alert:errors.acceptTerms.title'),
      message: I18n.t('alert:errors.acceptTerms.message')
    }
  });
  Analytics.trackEvent(EVENTS.ACCEPT_TERMS_ERROR);
};

export const acceptTermsSuccess = function* () {
  NavigationService.navigate({ routeName: 'Main' });
  yield put({
    type: GrowlTypes.ALERT,
    props: {
      type: 'info',
      title: I18n.t('alert:success.acceptTerms.title'),
      message: I18n.t('alert:success.acceptTerms.message')
    }
  });

  Analytics.trackEvent(EVENTS.ACCEPT_TERMS_SUCCESS);
};

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
  const country = yield select(countrySelector);

  yield put({
    type: DeliveryTypes.UPDATE_PROPS,
    props: { userId: payload.userId }
  });
  yield put({ type: DeliveryTypes.INIT_CHECKLIST });

  Appcenter.setUserId(`${payload.driverId}-${country}`);
  const brazeUserId = `d${payload.driverId}`;
  Braze.changeUser(brazeUserId);
};
