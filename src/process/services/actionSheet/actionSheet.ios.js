import { ActionSheetIOS } from 'react-native';

import I18n from 'Locales/I18n';

import { colors } from 'Resources/theme';

export default ({ optionKeys, options, config }) => {
  const { destructiveButtonIndex } = config;
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: [I18n.t('general:cancel'), ...optionKeys],
      destructiveButtonIndex,
      cancelButtonIndex: 0,
      tintColor: colors.primary
    },
    (buttonIndex) => {
      if (options[optionKeys[buttonIndex - 1]]) {
        options[optionKeys[buttonIndex - 1]]();
      }
    }
  );
};
