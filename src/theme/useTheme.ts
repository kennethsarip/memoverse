import { useColorScheme } from 'react-native';

import { themes, type ColorScheme, type ThemeColors } from './tokens';
import { useThemeModeStore } from './themeStore';

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  /** Flips the effective scheme: light<->dark, pinning it (drops system-follow). */
  toggleScheme: () => void;
}

/** Resolve the active theme: the user's pinned choice, or the device setting. */
export function useTheme(): Theme {
  const deviceScheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const mode = useThemeModeStore((state) => state.mode);
  const setMode = useThemeModeStore((state) => state.setMode);

  const scheme: ColorScheme = mode === 'system' ? deviceScheme : mode;

  return {
    scheme,
    colors: themes[scheme],
    toggleScheme: () => setMode(scheme === 'dark' ? 'light' : 'dark'),
  };
}
