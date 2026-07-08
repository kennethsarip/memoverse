import { create } from 'zustand';

import type { ReviewEventRecord, UserVerseRecord, VerseProgressRecord } from './types';

interface LocalLibraryState {
  userVerses: UserVerseRecord[];
  verseProgress: VerseProgressRecord[];
  reviewEvents: ReviewEventRecord[];
  addVerse: (userVerse: UserVerseRecord, progress: VerseProgressRecord) => void;
  applyReviewOutcome: (progress: VerseProgressRecord, event: ReviewEventRecord) => void;
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
  reviewEvents: [],
  addVerse: (userVerse, progress) =>
    set((state) => ({
      userVerses: [...state.userVerses, userVerse],
      verseProgress: [...state.verseProgress, progress],
    })),
  // Replaces one verse_progress row (by userVerseId) and appends one
  // review_event, in a single update (Section 7, Phase 1.9 session finish).
  applyReviewOutcome: (progress, event) =>
    set((state) => ({
      verseProgress: state.verseProgress.map((row) =>
        row.userVerseId === progress.userVerseId ? progress : row,
      ),
      reviewEvents: [...state.reviewEvents, event],
    })),
}));
