import React from 'react';
import PropTypes from 'prop-types';
import { Platform, Switch as RNSwitch } from 'react-native';

import { colors } from 'Theme';

const Switch = (props) => {
  const { onValueChange, value } = props;
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
    />
  );
};

Switch.defaultProps = {
  value: false,
  onValueChange: () => {}
};

Switch.propTypes = {
  value: PropTypes.bool,
  onValueChange: PropTypes.func
};

export default Switch;
