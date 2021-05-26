//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { Platform, Switch as RNSwitch } from 'react-native';

import { colors } from 'Theme';

const Switch = props => {
  const { onValueChange, testID, value } = props;
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
      trackColor={trackColor}
      {...platformProps}
      onValueChange={onValueChange}
      value={value}
      testID={testID}
    />
  );
};

Switch.defaultProps = {
  onValueChange: () => {},
  value: false
};

Switch.propTypes = {
  onValueChange: PropTypes.func,
  testID: PropTypes.string,
  value: PropTypes.bool
};

export default Switch;
