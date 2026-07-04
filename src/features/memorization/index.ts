/**
 * Memorization feature: the session runner (pure state machine over the 1.2
 * first-letter engine) plus the temporary seeded verse for the 1.3 demo.
 */
export {
  applyKey,
  attemptAccuracy,
  isRevealed,
  startVerseAttempt,
  type KeyOutcome,
  type KeyResult,
  type VerseAttempt,
} from './sessionRunner';
export { SAMPLE_VERSE, type SampleVerse } from './sampleVerse';
