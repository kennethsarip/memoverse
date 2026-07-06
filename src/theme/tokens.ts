import palette from './palette.json';

/**
 * Design tokens: the single source of truth for colors, spacing, radii, and
 * typography used by React Native code (StyleSheet / inline styles). Tailwind
 * (NativeWind) classes share the same primitives via src/theme/palette.json.
 *
 * Components must pull from here (or from NativeWind classes) instead of
 * hard-coding hex values or spacing numbers. Semantic names below mirror the
 * locked "living-water" prototype (CLAUDE.md Section 1/7 1.5) so components
 * built from it map 1:1 onto these tokens.
 */

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string; // page background behind cards
  surface: string; // card / sheet surface
  surfaceMuted: string; // secondary surface (stat tiles, chip rest state)
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textUpcoming: string; // faintest text (e.g. not-yet-due list rows)
  border: string;
  primary: string;
  primaryStrong: string; // emphasis text/icons on a primarySoft background
  primarySoft: string; // tinted primary surface (badge/icon chips)
  onPrimary: string;
  streak: string;
  streakSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
}

function buildColors(scheme: ColorScheme): ThemeColors {
  const living = palette.living[scheme];
  const tone = <T extends { light: string; dark: string }>(shape: T) => shape[scheme];
  const toneSoft = <T extends { lightSoft: string; darkSoft: string }>(shape: T) =>
    scheme === 'light' ? shape.lightSoft : shape.darkSoft;

  return {
    background: living.page,
    surface: living.app,
    surfaceMuted: living.surface2,
    textPrimary: living.ink,
    textSecondary: living.inkSoft,
    textMuted: living.inkFaint,
    textUpcoming: living.inkUpcoming,
    border: living.line,
    primary: scheme === 'light' ? palette.brand['500'] : palette.brand['400'],
    primaryStrong: living.primaryStrong,
    primarySoft: living.primarySoft,
    onPrimary: palette.neutral['0'],
    streak: tone(palette.streak),
    streakSoft: toneSoft(palette.streak),
    success: tone(palette.success),
    successSoft: toneSoft(palette.success),
    warning: palette.warning['500'],
    warningSoft: palette.warning['100'],
    danger: tone(palette.danger),
    dangerSoft: toneSoft(palette.danger),
  };
}

export const lightColors: ThemeColors = buildColors('light');
export const darkColors: ThemeColors = buildColors('dark');

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

// Radius scale, named after the prototype surfaces that use each value
// (CLAUDE.md 1.5): chip/pill are fully round, card/ring match the mockup's
// 20px cards, bar is the floating tab bar's 22px, sheet is the bottom-sheet's
// 26px top corners.
export const radii = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 16,
  card: 20,
  bar: 22,
  sheet: 26,
  full: 9999,
} as const;

// Poppins weights for UI chrome, Georgia for scripture body text (CLAUDE.md
// Section 1 "Brand and UI direction"). Font family names match the
// @expo-google-fonts/poppins export names loaded in app/_layout.tsx.
export const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
  verse: 'Georgia',
} as const;

// No fontWeight alongside these: each fontFamily already names its weight
// (e.g. Poppins_700Bold), and pairing that with fontWeight can make RN
// synthesize a faux-bold on top of it, especially on Android.
export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: fontFamily.extraBold },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fontFamily.bold },
  heading: { fontSize: 18, lineHeight: 24, fontFamily: fontFamily.bold },
  // Roomy line height so wrapped word chips in the verse card breathe.
  verse: { fontSize: 22, lineHeight: 36, fontFamily: fontFamily.verse },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.medium },
  tabLabel: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.medium },
} as const;

export const themes: Record<ColorScheme, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

export { palette };
