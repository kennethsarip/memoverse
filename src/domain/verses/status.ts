import { isMastered, tierForState } from '@/domain/srs';

import type { LibraryStatus, LibraryVerse } from './types';

/**
 * Map a verse's SRS state to a Verses-screen status (Section 7, Phase 1.6
 * filter chips). Mirrors the Section 8.3 tier mapping: Tier 1 reads as
 * "learning", Tier 2 and a not-yet-mastered Tier 3 both read as "reviewing"
 * (mastery is a stricter, separate bar than just reaching Tier 3), and only a
 * verse that clears isMastered reads as "mastered".
 */
export function statusForVerse(
  verse: Pick<LibraryVerse, 'srsState' | 'lastGrade'>,
): LibraryStatus {
  if (isMastered(verse.srsState, verse.lastGrade ?? 0)) return 'mastered';
  return tierForState(verse.srsState) === 1 ? 'learning' : 'reviewing';
}

/** A verse is overdue once its due day is strictly before `now` ('YYYY-MM-DD',
 * injected — never Date.now()). Due-today is due but not yet overdue. */
export function isOverdue(dueOn: string, now: string): boolean {
  return dueOn < now;
}

/** A verse belongs to a filter chip if the chip is 'all' or matches its status. */
export function matchesFilter(
  verse: LibraryVerse,
  filter: 'all' | LibraryStatus,
): boolean {
  return filter === 'all' || statusForVerse(verse) === filter;
}

/**
 * Sort verses for the Verses screen: overdue-first (most overdue first), then
 * due-today, then not-yet-due in ascending due order, ties broken by id so
 * ordering stays deterministic.
 */
export function sortForLibrary(verses: LibraryVerse[], now: string): LibraryVerse[] {
  return [...verses].sort((a, b) => {
    const aOverdue = isOverdue(a.dueOn, now);
    const bOverdue = isOverdue(b.dueOn, now);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    if (a.dueOn !== b.dueOn) return a.dueOn < b.dueOn ? -1 : 1;
    return a.userVerseId.localeCompare(b.userVerseId);
  });
}
