import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import I18n from 'Locales/I18n';
import { Button } from 'Components';
import { colors } from 'Theme';
import { ColumnView, Modal, RowView, SafeAreaView } from 'Containers';

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
    const { visible, optionKeys } = this.props;

    return (
      <Modal visible={visible} transparent onRequestClose={this.dismissSheet}>
        <SafeAreaView style={style.sawrapper}>
          <ColumnView
            flex={1}
            justifyContent={'flex-end'}
            alignItems={'stretch'}>
            <TouchableOpacity
              onPress={this.dismissSheet}
              style={style.touchToExit}
            />
            {optionKeys.map(this.renderOption)}
            <RowView backgroundColor={colors.standard}>
              <Button.Plain
                onPress={this.dismissSheet}
                textAlign={'left'}
                title={I18n.t('general:cancel')}
                width={'100%'}
              />
            </RowView>
          </ColumnView>
        </SafeAreaView>
      </Modal>
    );
  };

  renderOption = (optionName, optionIndex) => (
    <RowView key={optionIndex} backgroundColor={colors.standard}>
      <Button.Plain
        onPress={this.actionAndDismiss.bind(null, optionName)}
        textAlign={'left'}
        title={optionName}
        width={'100%'}
      />
    </RowView>
  );
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
  options: PropTypes.object,
  optionKeys: PropTypes.array,
  updateProps: PropTypes.func.isRequired,
  visible: PropTypes.bool
};

export default ActionSheetAndroid;
