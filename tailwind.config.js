/** @type {import('tailwindcss').Config} */
// Palette primitives live in src/theme/palette.json so the Tailwind classes and
// the typed theme tokens (src/theme/tokens.ts) never drift apart.
const palette = require('./src/theme/palette.json');

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: palette.brand,
        accent: palette.accent,
        success: palette.success,
        warning: palette.warning,
        danger: palette.danger,
        neutral: palette.neutral,
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
