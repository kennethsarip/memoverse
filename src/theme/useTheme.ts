import { useColorScheme } from 'react-native';

import { themes, type ColorScheme, type ThemeColors } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
}

/** Resolve the active theme from the device color scheme (defaults to light). */
export function useTheme(): Theme {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: themes[scheme] };
}
