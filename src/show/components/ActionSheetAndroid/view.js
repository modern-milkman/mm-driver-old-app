import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import { colors } from 'Theme';
import I18n from 'Locales/I18n';
import List from 'Components/List';
import Separator from 'Components/Separator';
import { ColumnView, Modal } from 'Containers';

import style from './style';

class ActionSheetAndroid extends React.Component {
  actionAndDismiss = (optionName) => {
    const { options } = this.props;
    options[optionName]();
    this.dismissSheet();
  };

  dismissSheet = () => {
    this.props.updateProps({ visible: false });
  };

  render = () => {
    const { visible, optionKeys, destructiveButtonIndex } = this.props;

    const data = optionKeys.map((optK, idx) =>
      idx !== destructiveButtonIndex - 1
        ? { title: optK, key: optK }
        : { title: optK, titleColor: colors.error, key: optK }
    );

    data.push({
      onPress: this.dismissSheet,
      title: I18n.t('general:cancel'),
      titleColor: colors.secondaryLight
    });

    return (
      <Modal visible={visible} transparent onRequestClose={this.dismissSheet}>
        <ColumnView
          flex={1}
          justifyContent={'flex-end'}
          alignItems={'stretch'}
          width={'auto'}>
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
  updateProps: PropTypes.func.isRequired,
  visible: PropTypes.bool
};

export default ActionSheetAndroid;
