import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeModeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

/**
 * User's theme preference, in memory for this session. Defaults to
 * following the device setting; the in-app toggle (CLAUDE.md 1.5) can pin
 * light or dark. Persisting this across relaunches lands with the offline
 * storage phase (1.14).
 */
export const useThemeModeStore = create<ThemeModeState>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
}));
