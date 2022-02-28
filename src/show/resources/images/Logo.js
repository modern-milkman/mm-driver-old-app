import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';

import { defaults } from 'Theme';

const Logo = ({ width }) => (
  <Image
    style={{ width, height: width, borderRadius: defaults.borderRadius }}
    source={require('./logo.png')}
  />
);

Logo.defaultProps = {
  width: 100
};

Logo.propTypes = {
  width: PropTypes.number
};

export default Logo;
