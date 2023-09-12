import { connect } from 'react-redux';

import { Creators as userActions } from 'Reducers/user';
import { Creators as applicationActions } from 'Reducers/application';
import { Creators as inAppBrowserActions } from 'Reducers/inappbrowser';

import AcceptTerms from './view';

export default connect(
  state => ({
    acceptedTermsVersion: state.user.acceptedTermsVersion,
    minimumTermsVersion: state.device.minimumTermsVersion,
    processing: state.transient.processing
  }),
  {
    acceptTerms: userActions.acceptTerms,
    logout: applicationActions.logout,
    updateInAppBrowserProps: inAppBrowserActions.updateProps
  }
)(AcceptTerms);
