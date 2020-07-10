// SEE https://facebook.github.io/react-native/docs/actionsheetios
// USES MODAL + BUTTONS for android
// usage after import from Services/actionSheet
// actionSheet(options = { key: callback }, config = {});
// config could have destructiveButtonIndex for iOS
// android ignores config

import actionSheet from './actionSheet';

export default (options = {}, config = {}) => {
  const optionKeys = Object.keys(options);
  if (optionKeys && optionKeys.length === 0) {
    throw new Error('Action Sheets must have at least 1 option');
  } else {
    actionSheet({ optionKeys, options, config });
  }
};
