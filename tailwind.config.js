/** @type {import('tailwindcss').Config} */
// Palette primitives live in src/theme/palette.json so the Tailwind classes and
// the typed theme tokens (src/theme/tokens.ts) never drift apart.
const palette = require('./src/theme/palette.json');

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' (not the Tailwind-default 'media'): the app drives light/dark from
  // src/theme's own useTheme()/themeStore, not Tailwind's dark: variant, and
  // NativeWind's web runtime throws trying to sync system scheme when this is
  // left as 'media' (see BUILD_HISTORY.md 1.5).
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: palette.brand,
        streak: palette.streak,
        success: palette.success,
        warning: palette.warning,
        danger: palette.danger,
        neutral: palette.neutral,
        living: palette.living,
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
