//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { Platform, Switch as RNSwitch } from 'react-native';

import { mock } from 'Helpers';
import { useTheme } from 'Containers';

const Switch = props => {
  const { alphaColor, colors } = useTheme();
  const { disabled, onValueChange, testID, value } = props;
  const trackColor = {
    false: Platform.select({
      android: disabled ? alphaColor('input', 0.4) : colors.input
    }),
    true: Platform.select({
      android: disabled ? alphaColor('input', 0.4) : colors.primaryBright,
      ios: colors.primaryBright
    })
  };
  const platformProps = Platform.select({
    android: {
      thumbColor: disabled
        ? colors.input
        : value
          ? colors.whiteOnly
          : colors.primaryBright
    },
    ios: {
      ios_backgroundColor: colors.input
    }
  });

  return (
    <RNSwitch
      disabled={disabled}
      trackColor={trackColor}
      {...platformProps}
      onValueChange={onValueChange}
      value={value}
      testID={testID}
    />
  );
};

Switch.defaultProps = {
  disabled: false,
  onValueChange: mock,
  value: false
};

Switch.propTypes = {
  disabled: PropTypes.bool,
  onValueChange: PropTypes.func,
  testID: PropTypes.string,
  value: PropTypes.bool
};

export default Switch;
