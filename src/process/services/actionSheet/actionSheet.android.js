import store from '/process/redux/store';
import { Creators as ActionSheetAndroidActions } from '/process/reducers/actionsheetandroid';

export default ({ optionKeys, options }) => {
  const { dispatch } = store().store;
  dispatch(
    ActionSheetAndroidActions.updateProps({
      optionKeys,
      options,
      visible: true
    })
  );
};
