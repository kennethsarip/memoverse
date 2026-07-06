import type { ConfigContext, ExpoConfig } from 'expo/config';

// Env-driven Expo config. Public Supabase values are read at runtime via
// process.env.EXPO_PUBLIC_* (see src/lib/supabase.ts); they are not embedded here.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Fount',
  slug: 'fount',
  scheme: 'fount',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic', // support light and dark
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.fount',
  },
  android: {
    package: 'app.fount',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#E9F6FD',
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
