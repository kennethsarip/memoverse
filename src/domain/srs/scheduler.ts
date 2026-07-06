import type { Grade, ScheduledState, SrsState } from './types';

/** Ease bounds (Section 8.2). Floor at 1.3 so failed cards never collapse to
 * daily forever; ceiling at 2.7 so easy cards do not balloon intervals. */
const MIN_EASE = 1.3;
const MAX_EASE = 2.7;

/** A grade below 3 is a lapse; the verse relearns from scratch tomorrow. */
const PASSING_GRADE = 3;

/** The neutral starting state for a brand-new verse (matches verse_progress defaults). */
export const INITIAL_SRS_STATE: SrsState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
};

function clampEase(ease: number): number {
  return Math.min(Math.max(ease, MIN_EASE), MAX_EASE);
}

/**
 * SM-2 ease delta for a passing grade: EF + (0.1 - (5-g)*(0.08 + (5-g)*0.02)).
 * Grade 5 -> +0.1, grade 4 -> 0, grade 3 -> -0.14. Not applied on a lapse.
 */
function nextEase(ease: number, grade: Grade): number {
  const miss = 5 - grade;
  return clampEase(ease + (0.1 - miss * (0.08 + miss * 0.02)));
}

/**
 * Advance SRS state by one graded review (Section 8.2).
 * - Fail (grade < 3): reset repetitions to 0 and relearn tomorrow (interval 1);
 *   ease is unchanged but still floored so a lapse can never sink below 1.3.
 * - Pass (grade >= 3): count the rep and grow the interval — 1 day on the first
 *   rep, 3 on the second, then the previous interval scaled by the UPDATED ease.
 */
export function schedule(state: SrsState, grade: Grade): ScheduledState {
  if (grade < PASSING_GRADE) {
    return {
      easeFactor: clampEase(state.easeFactor),
      intervalDays: 1,
      repetitions: 0,
      dueInDays: 1,
    };
  }

  const easeFactor = nextEase(state.easeFactor, grade);
  const repetitions = state.repetitions + 1;
  const intervalDays =
    repetitions === 1
      ? 1
      : repetitions === 2
        ? 3
        : Math.round(state.intervalDays * easeFactor);

  return { easeFactor, intervalDays, repetitions, dueInDays: intervalDays };
}
