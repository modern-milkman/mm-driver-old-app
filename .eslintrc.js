module.exports = {
  root: true,
  extends: '@react-native-community',
  plugins: ['react', 'react-native'],
  rules: {
    'comma-dangle': ['error', 'never'],
    radix: ['error', 'as-needed'],
    'no-console': ['error']
  }
};
