import palette from './palette.json';

/**
 * Design tokens: the single source of truth for colors, spacing, radii, and
 * typography used by React Native code (StyleSheet / inline styles). Tailwind
 * (NativeWind) classes share the same primitives via src/theme/palette.json.
 *
 * Components must pull from here (or from NativeWind classes) instead of
 * hard-coding hex values or spacing numbers.
 */

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: palette.neutral['50'],
  surface: palette.neutral['0'],
  surfaceMuted: palette.neutral['100'],
  textPrimary: palette.neutral['900'],
  textSecondary: palette.neutral['600'],
  textMuted: palette.neutral['400'],
  border: palette.neutral['200'],
  primary: palette.brand['500'],
  onPrimary: palette.neutral['0'],
  accent: palette.accent['400'],
  success: palette.success['500'],
  warning: palette.warning['500'],
  danger: palette.danger['500'],
};

export const darkColors: ThemeColors = {
  background: palette.neutral['950'],
  surface: palette.neutral['900'],
  surfaceMuted: palette.neutral['800'],
  textPrimary: palette.neutral['50'],
  textSecondary: palette.neutral['300'],
  textMuted: palette.neutral['500'],
  border: palette.neutral['700'],
  primary: palette.brand['400'],
  onPrimary: palette.neutral['950'],
  accent: palette.accent['300'],
  success: palette.success['500'],
  warning: palette.warning['500'],
  danger: palette.danger['500'],
};

// Spacing scale in px (4pt grid). Use tokens, never raw numbers, in components.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '800', lineHeight: 40 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  heading: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  // Roomy line height so wrapped word chips in the verse card breathe.
  verse: { fontSize: 22, fontWeight: '600', lineHeight: 36 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
} as const;

export const themes: Record<ColorScheme, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

export { palette };
