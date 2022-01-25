import store from 'Redux/store';
import { Creators as ActionSheetAndroidActions } from 'Reducers/actionsheetandroid';

export default ({
  optionKeys,
  options,
  config: { destructiveButtonIndex, title }
}) => {
  const { dispatch } = store().store;
  dispatch(
    ActionSheetAndroidActions.updateProps({
      destructiveButtonIndex,
      optionKeys,
      options,
      title,
      visible: true
    })
  );
};
