import React from 'react';
import PropTypes from 'prop-types';

import { useTheme } from './index';

const withThemedHOC = Component => {
  return props => {
    const theme = useTheme();
    return <Component theme={theme} {...props} />;
  };
};

withThemedHOC.propTypes = {
  Component: PropTypes.any
};

export default withThemedHOC;
