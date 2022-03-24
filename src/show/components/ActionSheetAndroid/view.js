//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import List from 'Components/List';
import Separator from 'Components/Separator';
import { ColumnView, Modal, withThemedHOC } from 'Containers';

import style from './style';

class ActionSheetAndroid extends React.Component {
  actionAndDismiss = optionName => {
    const { options } = this.props;
    options[optionName]();
    this.dismissSheet();
  };

  dismissSheet = () => {
    this.props.updateProps({ visible: false });
  };

  render = () => {
    const {
      destructiveButtonIndex,
      optionKeys,
      visible,
      testID,
      theme: { colors }
    } = this.props;

    const data = optionKeys.map((optK, idx) =>
      idx !== destructiveButtonIndex - 1
        ? { title: optK, key: optK }
        : { title: optK, titleColor: colors.error, key: optK }
    );

    data.push({
      onPress: this.dismissSheet,
      title: I18n.t('general:cancel'),
      titleColor: colors.inputSecondary
    });

    return (
      <Modal visible={visible} transparent onRequestClose={this.dismissSheet}>
        <ColumnView
          flex={1}
          justifyContent={'flex-end'}
          alignItems={'stretch'}
          width={'auto'}
          testID={testID}>
          <TouchableOpacity
            onPress={this.dismissSheet}
            style={style.touchToExit}
          />
          <Separator />

          <ColumnView backgroundColor={colors.neutral}>
            <List
              onPress={this.actionAndDismiss}
              data={data}
              renderListEmptyComponent={null}
            />
          </ColumnView>
        </ColumnView>
      </Modal>
    );
  };
}

ActionSheetAndroid.defaultProps = {
  config: {},
  options: {},
  optionKeys: [],
  updateProps: mock,
  visible: false
};

ActionSheetAndroid.propTypes = {
  config: PropTypes.object,
  destructiveButtonIndex: PropTypes.number,
  options: PropTypes.object,
  optionKeys: PropTypes.array,
  theme: PropTypes.object,
  testID: PropTypes.string,
  updateProps: PropTypes.func.isRequired,
  visible: PropTypes.bool
};

export default withThemedHOC(ActionSheetAndroid);
