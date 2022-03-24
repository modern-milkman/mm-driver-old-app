module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:react/recommended'],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-native'],
  rules: {
    'comma-dangle': ['error', 'never'],
    radix: ['error', 'as-needed'],
    'no-console': ['error'],
    'react/display-name': 'off'
  }
};
