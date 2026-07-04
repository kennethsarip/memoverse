import { deriveFirstLetter } from './tokenize';
import type { Token } from './types';

/**
 * Is the typed key correct for the expected token? Case-insensitive for letters,
 * literal for digits, and it ignores leading punctuation in the input the same
 * way tokenize() does, so typing '"F' still matches the token 'For'.
 */
export function isCorrectFirstLetter(input: string, expected: Token): boolean {
  const key = deriveFirstLetter(input);
  if (key === '') return false;
  return key === expected.firstLetter;
}

/**
 * Accuracy for a completed verse attempt: fraction of tokens the user got right
 * on the first try, clamped to [0, 1]. Zero tokens yields 0 (nothing to grade),
 * avoiding a divide-by-zero.
 */
export function computeAccuracy(totalTokens: number, correctFirstTries: number): number {
  if (totalTokens <= 0) return 0;
  const clamped = Math.min(Math.max(correctFirstTries, 0), totalTokens);
  return clamped / totalTokens;
}
