import type { Grade } from '@/domain/srs';

/** Mirrors the user_verses columns (Section 5.1), plus a display cache
 * (cachedReference/cachedSnippet) resolved once at add-time so the Verses
 * screen never needs an async content join to render a row. */
export interface UserVerseRecord {
  id: string;
  scriptureRefId: string | null;
  translationId: string | null;
  source: 'pack' | 'custom';
  customRef: string | null;
  customText: string | null;
  cachedReference: string;
  cachedSnippet: string;
  addedAt: string;
  archived: boolean;
}

/** Mirrors the verse_progress columns (Section 5.1). */
export interface VerseProgressRecord {
  id: string;
  userVerseId: string;
  difficultyTier: 1 | 2 | 3;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueOn: string;
  lastReviewedAt: string | null;
  lastGrade: Grade | null;
  isMastered: boolean;
}

/** Mirrors the review_events columns (Section 5.1): an append-only history
 * of graded stage attempts, one per stage completed in a session. */
export interface ReviewEventRecord {
  id: string;
  userVerseId: string;
  reviewedAt: string;
  mode: 'first_letter';
  difficultyTier: 1 | 2 | 3;
  grade: Grade;
  accuracy: number;
  durationMs: number | null;
}
