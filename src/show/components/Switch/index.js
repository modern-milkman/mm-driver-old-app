//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { Platform, Switch as RNSwitch } from 'react-native';

import { mock } from 'Helpers';
import { colors } from 'Theme';

const Switch = props => {
  const { disabled, onValueChange, testID, value } = props;
  const trackColor = {
    false: Platform.select({
      android: colors.input
    }),
    true: Platform.select({
      android: colors.input,
      ios: colors.primary
    })
  };
  const platformProps = Platform.select({
    android: {
      thumbColor: colors.primary
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
