import React from 'react';
import PropTypes from 'prop-types';
import { Pressable } from 'react-native';

import mock from 'Helpers';
import { Text } from 'Components';
import { RowView, useTheme, useThemedStyles } from 'Containers';

import unthemedStyle from './style';

const SegmentedButton = ({
  label,
  onPress,
  first = false,
  last = false,
  selected,
  value
}) => {
  const { colors } = useTheme();
  const style = useThemedStyles(unthemedStyle);

  return (
    <Pressable
      onPress={onPress.bind(null, value)}
      style={[
        style.segment,
        first && style.firstSegment,
        last && style.lastSegment,
        selected && style.selectedSegment
      ]}>
      <Text.Label color={selected ? colors.white : colors.primary}>
        {label}
      </Text.Label>
    </Pressable>
  );
};

const SegmentedControl = props => {
  const { buttons, selected, onPress } = props;
  return (
    <RowView width={'auto'}>
      {buttons.map((btn, index) => (
        <SegmentedButton
          key={index}
          selected={selected === btn.value}
          onPress={onPress}
          {...btn}
          {...{ first: index === 0, last: index === buttons.length - 1 }}
        />
      ))}
    </RowView>
  );
};

SegmentedControl.defaultProps = {
  buttons: [],
  onPress: mock
};

SegmentedControl.propTypes = {
  buttons: PropTypes.array,
  selected: PropTypes.string,
  onPress: PropTypes.func
};

SegmentedButton.defaultProps = {
  label: '',
  value: null,
  first: false,
  last: false,
  selected: false
};

SegmentedButton.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onPress: PropTypes.func,
  first: PropTypes.bool,
  last: PropTypes.bool,
  selected: PropTypes.bool
};
export default SegmentedControl;
