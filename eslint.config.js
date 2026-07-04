// ESLint flat config: Expo's recommended rules + Prettier integration.
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  ...expoConfig,
  prettierRecommended,
  {
    // Jest setup + manual mocks run in the test runtime; expose those globals.
    files: ['jest.setup.js', '__mocks__/**'],
    languageOptions: {
      globals: { jest: 'readonly', require: 'readonly', module: 'writable' },
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'coverage/*', 'android/*', 'ios/*'],
  },
];
