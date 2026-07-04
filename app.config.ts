import type { ConfigContext, ExpoConfig } from 'expo/config';

// Env-driven Expo config. Public Supabase values are read at runtime via
// process.env.EXPO_PUBLIC_* (see src/lib/supabase.ts); they are not embedded here.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MemoVerse',
  slug: 'memoverse',
  scheme: 'memoverse',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic', // support light and dark
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.memoverse',
  },
  android: {
    package: 'app.memoverse',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#EEF0FE',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
});
