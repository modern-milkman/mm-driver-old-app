import { connect } from 'react-redux';

import { Creators as InAppBrowserActions } from 'Reducers/inappbrowser';

import InAppBrowser from './view';

export default connect(
  state => ({
    ...state.inappbrowser
  }),
  {
    updateProps: InAppBrowserActions.updateProps
  }
)(InAppBrowser);
