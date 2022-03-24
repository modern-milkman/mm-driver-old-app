import { ActionSheetIOS } from 'react-native';

import store from 'Redux/store';
import I18n from 'Locales/I18n';

export default ({
  config: { destructiveButtonIndex, title },
  optionKeys,
  options
}) => {
  const { getState } = store().store;
  const { device } = getState();

  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: [I18n.t('general:cancel'), ...optionKeys],
      destructiveButtonIndex,
      cancelButtonIndex: 0,
      userInterfaceStyle: device.darkMode ? 'dark' : 'light',
      tintColor: device.darkMode ? 'white' : undefined,
      title
    },
    buttonIndex => {
      if (options[optionKeys[buttonIndex - 1]]) {
        options[optionKeys[buttonIndex - 1]]();
      }
    }
  );
};
