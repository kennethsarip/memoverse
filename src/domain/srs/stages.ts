import type { Grade, SrsState, Tier } from './types';

/** Interval (days) at which a verse enters Tier 3 "Master it". */
const MASTER_INTERVAL_DAYS = 7;
/** Interval (days) a Tier-3 verse must survive to count as mastered. */
const MASTERY_INTERVAL_DAYS = 21;
/** Lowest passing grade that still counts toward mastery. */
const MASTERY_MIN_GRADE = 4;

/**
 * Map SRS state to its session stage (Section 8.3). The tier is derived from the
 * interval, not a separate counter, so a verse's stage always tracks retention:
 * - Tier 1 "Type it": new or just-relearned (repetitions == 0).
 * - Tier 2 "Memorize it": reviewed, interval 1..6 days.
 * - Tier 3 "Master it": interval >= 7 days.
 */
export function tierForState(state: SrsState): Tier {
  if (state.repetitions === 0) return 1;
  return state.intervalDays >= MASTER_INTERVAL_DAYS ? 3 : 2;
}

/**
 * A verse is mastered (Section 8.3) when it is at Tier 3, has survived to a long
 * interval (>= 21 days), and was last recalled well (grade >= 4). A weak recall
 * or a shorter interval keeps it in active rotation.
 */
export function isMastered(state: SrsState, lastGrade: Grade): boolean {
  return (
    tierForState(state) === 3 &&
    state.intervalDays >= MASTERY_INTERVAL_DAYS &&
    lastGrade >= MASTERY_MIN_GRADE
  );
}
