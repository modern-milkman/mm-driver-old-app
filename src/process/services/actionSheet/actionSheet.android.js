import store from 'Redux/store';
import { Creators as ActionSheetAndroidActions } from 'Reducers/actionsheetandroid';

export default ({
  optionKeys,
  options,
  config: { destructiveButtonIndex }
}) => {
  const { dispatch } = store().store;
  dispatch(
    ActionSheetAndroidActions.updateProps({
      optionKeys,
      options,
      visible: true,
      destructiveButtonIndex
    })
  );
};
