/**
 * Spaced-repetition scheduler (Section 8.2/8.3). Pure, deterministic, and free
 * of I/O or clock access — "now" is injected as a date string — so the whole
 * retention engine is unit-testable in isolation.
 */
export type {
  DueQueue,
  Grade,
  SchedulableVerse,
  ScheduledState,
  SrsState,
  Tier,
} from './types';
export { INITIAL_SRS_STATE, schedule } from './scheduler';
export { gradeFromAccuracy } from './grade';
export { isMastered, tierForState } from './stages';
export { buildDueQueue, DEFAULT_NEW_VERSES_PER_SESSION } from './dueQueue';
