import { connect } from 'react-redux';

import { Creators as ActionSheetAndroidActions } from '/process/reducers/actionsheetandroid';

import ActionSheetAndroid from './view';

export default connect(
  (state) => ({
    ...state.actionsheetandroid
  }),
  {
    updateProps: ActionSheetAndroidActions.updateProps
  }
)(ActionSheetAndroid);
