import type { DueQueue, SchedulableVerse } from './types';

/** How many unseen verses a single session introduces by default (Section 6.2:
 * "a few new verses", sized for short daily sessions). */
export const DEFAULT_NEW_VERSES_PER_SESSION = 3;

/** A verse is due when its calendar day is today or earlier. ISO 'YYYY-MM-DD'
 * strings compare lexicographically in date order, so no Date parsing is needed. */
function isDue(now: string, verse: SchedulableVerse): boolean {
  return verse.dueOn <= now;
}

/**
 * Assemble one session's work as of `now` (an injected 'YYYY-MM-DD', never
 * Date.now()): every due review plus up to `newVersesLimit` never-reviewed
 * verses. Reviews are ordered most-overdue first, ties broken by id so the queue
 * is deterministic; new verses keep their input order. Future-dated verses are
 * excluded from both.
 */
export function buildDueQueue(
  now: string,
  verses: SchedulableVerse[],
  newVersesLimit: number = DEFAULT_NEW_VERSES_PER_SESSION,
): DueQueue {
  const due = verses.filter((verse) => isDue(now, verse));

  const reviews = due
    .filter((verse) => verse.lastReviewedAt !== null)
    .sort((a, b) =>
      a.dueOn === b.dueOn ? a.id.localeCompare(b.id) : a.dueOn < b.dueOn ? -1 : 1,
    );

  const newVerses = due
    .filter((verse) => verse.lastReviewedAt === null)
    .slice(0, Math.max(newVersesLimit, 0));

  return { reviews, newVerses };
}
