import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useContext } from 'react';

import { alphaColors, colors } from 'Theme';

import withThemedHOC from './withThemedHOC';

const ThemeContext = React.createContext();

const ThemeProvider = ({ children, darkMode }) => {
  const themeType = {
    theme: darkMode ? 'dark' : 'light',
    colors: darkMode ? colors('dark') : colors('light'),
    alphaColor: darkMode
      ? alphaColors.bind(null, 'dark')
      : alphaColors.bind(null, 'light')
  };

  return (
    <ThemeContext.Provider value={themeType}>{children}</ThemeContext.Provider>
  );
};

const useTheme = () => {
  return useContext(ThemeContext);
};

const useThemedStyles = styles => {
  const theme = useTheme();
  return styles(theme);
};

const mapStateToProps = state => ({
  darkMode: state.device.darkMode
});

const ThemeProviderConnected = connect(mapStateToProps, {})(ThemeProvider);

ThemeProvider.propTypes = {
  children: PropTypes.any,
  darkMode: PropTypes.string
};

export {
  ThemeProviderConnected as ThemeProvider,
  useTheme,
  useThemedStyles,
  withThemedHOC
};
