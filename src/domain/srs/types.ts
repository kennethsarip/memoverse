/**
 * Spaced-repetition types (Section 8.2/8.3). Pure data — no I/O, no React, no
 * clock. The clock is injected as a date string wherever "now" is needed.
 */

/** 0-2 = fail, 3 = hard, 4 = good, 5 = easy. */
export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

/** Difficulty tier / session stage: 1 Type it, 2 Memorize it, 3 Master it. */
export type Tier = 1 | 2 | 3;

/** The SM-2 state persisted per verse (mirrors verse_progress columns). */
export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

/** schedule() returns the next state plus how many days until it is due again. */
export type ScheduledState = SrsState & { dueInDays: number };

/**
 * The minimal verse shape buildDueQueue needs. `dueOn` is a calendar day
 * ('YYYY-MM-DD'); `lastReviewedAt` is null for a verse never reviewed (a "new"
 * verse), otherwise any non-empty timestamp.
 */
export interface SchedulableVerse {
  id: string;
  dueOn: string;
  lastReviewedAt: string | null;
}

/** A session's work: due reviews plus a capped set of new verses to introduce. */
export interface DueQueue {
  reviews: SchedulableVerse[];
  newVerses: SchedulableVerse[];
}
