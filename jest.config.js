/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Expo/React Native ship untranspiled ESM; allow-list what Babel must transform.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop|react-native-reanimated|react-native-worklets))',
  ],
  collectCoverageFrom: ['src/domain/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
  // Section 9 gate: domain + feature logic is the product's brain, so it must
  // stay at 90%+. CI runs `test:coverage`, which fails the build below this.
  coverageThreshold: {
    './src/domain/': { statements: 90, branches: 90, functions: 90, lines: 90 },
  },
};
