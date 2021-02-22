import React from 'react';
import PropTypes from 'prop-types';
import { Picker as PickerRN } from '@react-native-picker/picker';

import { mock } from 'Helpers';

import style from './style';

const Picker = ({
  customStyle,
  customItemStyle,
  items,
  onChange,
  selected
}) => {
  return (
    <PickerRN
      selectedValue={selected}
      style={[style.pickerStyle, customStyle]}
      itemStyle={[customItemStyle]}
      onValueChange={onChange}>
      {renderItems(items)}
    </PickerRN>
  );
};

const renderItems = (items) => {
  return items.map((item) => (
    <PickerRN.Item key={item} label={item.description} value={item.id} />
  ));
};

Picker.propTypes = {
  customItemStyle: PropTypes.object,
  customStyle: PropTypes.object,
  items: PropTypes.array,
  onChange: PropTypes.func,
  selected: PropTypes.any
};

Picker.defaultProps = {
  customItemStyle: {},
  customStyle: {},
  items: [],
  onChange: mock,
  selected: null
};

export default Picker;
