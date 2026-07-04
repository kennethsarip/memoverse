// ESLint flat config: Expo's recommended rules + Prettier integration.
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  ...expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'coverage/*', 'android/*', 'ios/*'],
  },
];
