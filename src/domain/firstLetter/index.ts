/**
 * First-letter memorization engine (Section 8.1). Pure, deterministic, and free
 * of I/O so it is fully unit-testable. UI and features consume it from here.
 */
export type { Tier, Token } from './types';
export { deriveFirstLetter, tokenize } from './tokenize';
export { hiddenIndexesForTier } from './tiers';
export { computeAccuracy, isCorrectFirstLetter } from './accuracy';
