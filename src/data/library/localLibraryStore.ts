import { create } from 'zustand';

import type { UserVerseRecord, VerseProgressRecord } from './types';

interface LocalLibraryState {
  userVerses: UserVerseRecord[];
  verseProgress: VerseProgressRecord[];
  addVerse: (userVerse: UserVerseRecord, progress: VerseProgressRecord) => void;
}

/**
 * Guest-mode local library: user_verses + verse_progress held in memory for
 * this session. Accounts (1.11) and offline SQLite persistence (1.14) do not
 * exist yet, so this is where a signed-out user's verses live for now — it is
 * intentionally swappable behind libraryRepository.ts without the Verses
 * screen changing.
 */
export const useLocalLibraryStore = create<LocalLibraryState>((set) => ({
  userVerses: [],
  verseProgress: [],
  addVerse: (userVerse, progress) =>
    set((state) => ({
      userVerses: [...state.userVerses, userVerse],
      verseProgress: [...state.verseProgress, progress],
    })),
}));
