/**
 * Session runner: the pure, deterministic state machine that drives one verse
 * attempt in the first-letter engine. It composes the Section 8.1 primitives
 * (tokenize, hiddenIndexesForTier, isCorrectFirstLetter, computeAccuracy) and
 * holds NO I/O, no React, and no clock, so the whole memorization flow is
 * unit-testable in isolation. The UI feeds it one typed key at a time.
 */
import {
  computeAccuracy,
  hiddenIndexesForTier,
  isCorrectFirstLetter,
  tokenize,
  type Tier,
  type Token,
} from '@/domain/firstLetter';

export interface VerseAttempt {
  readonly tokens: Token[];
  readonly tier: Tier;
  /** Indexes hidden by the tier (blank until answered). Empty at tier 1. */
  readonly hiddenIndexes: Set<number>;
  /** The token awaiting input; equals tokens.length once the verse is done. */
  readonly currentIndex: number;
  /** Tokens the user got right on the FIRST try — the numerator of accuracy. */
  readonly correctFirstTries: number;
  /** Whether the current token has been mistyped at least once this attempt. */
  readonly mistakeOnCurrent: boolean;
  readonly status: 'active' | 'complete';
}

/** 'ignored' means the attempt was already complete, so the key did nothing. */
export type KeyResult = 'correct' | 'incorrect' | 'ignored';

export interface KeyOutcome {
  readonly attempt: VerseAttempt;
  readonly result: KeyResult;
  /** The token index revealed by a correct key, else null. */
  readonly revealedIndex: number | null;
}

/**
 * Build a fresh attempt for a verse + reference at a difficulty tier. `seed`
 * fixes tier-2 word hiding so a session is stable and tests are reproducible.
 */
export function startVerseAttempt(
  verseText: string,
  reference: string,
  tier: Tier,
  seed = 0,
): VerseAttempt {
  const tokens = tokenize(verseText, reference);
  return {
    tokens,
    tier,
    hiddenIndexes: hiddenIndexesForTier(tokens, tier, seed),
    currentIndex: 0,
    correctFirstTries: 0,
    mistakeOnCurrent: false,
    status: tokens.length === 0 ? 'complete' : 'active',
  };
}

/**
 * Feed one typed key. Returns the next attempt plus what happened, without
 * mutating the input. A correct key advances and reveals the current token; a
 * wrong key flags a mistake (which forfeits first-try credit) but never
 * advances or punishes.
 */
export function applyKey(attempt: VerseAttempt, key: string): KeyOutcome {
  if (attempt.status === 'complete') {
    return { attempt, result: 'ignored', revealedIndex: null };
  }

  const expected = attempt.tokens[attempt.currentIndex];
  if (!isCorrectFirstLetter(key, expected)) {
    return {
      attempt: { ...attempt, mistakeOnCurrent: true },
      result: 'incorrect',
      revealedIndex: null,
    };
  }

  const nextIndex = attempt.currentIndex + 1;
  // First-try credit only if the token was never missed this attempt.
  const firstTryCredit = attempt.mistakeOnCurrent ? 0 : 1;
  return {
    attempt: {
      ...attempt,
      currentIndex: nextIndex,
      correctFirstTries: attempt.correctFirstTries + firstTryCredit,
      mistakeOnCurrent: false,
      status: nextIndex >= attempt.tokens.length ? 'complete' : 'active',
    },
    result: 'correct',
    revealedIndex: attempt.currentIndex,
  };
}

/** Accuracy (0..1) of the attempt so far: first-try hits over total tokens. */
export function attemptAccuracy(attempt: VerseAttempt): number {
  return computeAccuracy(attempt.tokens.length, attempt.correctFirstTries);
}

/**
 * Is a token's full word currently shown? Non-hidden tokens (tier 1, and the
 * shown half of tier 2) are always visible; a hidden token appears only after
 * it has been answered (its index is behind the cursor).
 */
export function isRevealed(attempt: VerseAttempt, index: number): boolean {
  if (!attempt.hiddenIndexes.has(index)) return true;
  return index < attempt.currentIndex;
}
