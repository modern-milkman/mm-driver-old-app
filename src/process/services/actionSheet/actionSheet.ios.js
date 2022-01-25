import { ActionSheetIOS } from 'react-native';

import I18n from 'Locales/I18n';

import { colors } from 'Theme';

export default ({
  config: { destructiveButtonIndex, title },
  optionKeys,
  options
}) => {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: [I18n.t('general:cancel'), ...optionKeys],
      destructiveButtonIndex,
      cancelButtonIndex: 0,
      tintColor: colors.primary,
      title
    },
    buttonIndex => {
      if (options[optionKeys[buttonIndex - 1]]) {
        options[optionKeys[buttonIndex - 1]]();
      }
    }
  );
};
