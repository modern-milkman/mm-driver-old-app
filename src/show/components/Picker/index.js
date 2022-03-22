//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { Picker as PickerRN } from '@react-native-picker/picker';

import { mock } from 'Helpers';
import { useTheme } from 'Containers';

import style from './style';

const Picker = ({
  customStyle,
  customItemStyle,
  items,
  onChange,
  selected,
  testID
}) => {
  const { colors } = useTheme();
  return (
    <PickerRN
      selectedValue={selected}
      style={[style.pickerStyle, customStyle]}
      itemStyle={[customItemStyle]}
      onValueChange={onChange}
      testID={testID}>
      {renderItems(items, colors)}
    </PickerRN>
  );
};

const renderItems = (items, colors) => {
  return items.map(item => (
    <PickerRN.Item
      key={item}
      color={colors.inputSecondary}
      label={item.description}
      value={item.id}
    />
  ));
};

Picker.propTypes = {
  customItemStyle: PropTypes.object,
  customStyle: PropTypes.object,
  items: PropTypes.array,
  onChange: PropTypes.func,
  selected: PropTypes.any,
  testID: PropTypes.string
};

Picker.defaultProps = {
  customItemStyle: {},
  customStyle: {},
  items: [],
  onChange: mock,
  selected: null
};

export default Picker;
