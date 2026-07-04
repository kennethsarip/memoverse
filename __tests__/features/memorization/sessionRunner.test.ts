import {
  applyKey,
  attemptAccuracy,
  isRevealed,
  startVerseAttempt,
} from '@/features/memorization/sessionRunner';

// A short, fully-known verse keeps the expected keystrokes obvious in the tests.
// tokens: For(f) God(g) so(s) loved(l) me(m) + reference John(j) 3(3) 16(1)
const TEXT = 'For God so loved me';
const REF = 'John 3:16';

describe('startVerseAttempt', () => {
  it('tokenizes verse + reference and starts on the first token', () => {
    const attempt = startVerseAttempt(TEXT, REF, 1);
    expect(attempt.tokens.map((t) => t.raw)).toEqual([
      'For',
      'God',
      'so',
      'loved',
      'me',
      'John',
      '3',
      '16',
    ]);
    expect(attempt.currentIndex).toBe(0);
    expect(attempt.correctFirstTries).toBe(0);
    expect(attempt.mistakeOnCurrent).toBe(false);
    expect(attempt.status).toBe('active');
  });

  it('tier 1 hides nothing; tier 3 hides everything', () => {
    expect(startVerseAttempt(TEXT, REF, 1).hiddenIndexes.size).toBe(0);
    expect(startVerseAttempt(TEXT, REF, 3).hiddenIndexes.size).toBe(8);
  });

  it('completes immediately for an empty verse (no tokens to type)', () => {
    const attempt = startVerseAttempt('', '', 1);
    expect(attempt.tokens).toHaveLength(0);
    expect(attempt.status).toBe('complete');
  });
});

describe('applyKey', () => {
  it('advances and reveals on the correct first letter', () => {
    const attempt = startVerseAttempt(TEXT, REF, 3);
    const { attempt: next, result, revealedIndex } = applyKey(attempt, 'f');
    expect(result).toBe('correct');
    expect(revealedIndex).toBe(0);
    expect(next.currentIndex).toBe(1);
    expect(next.correctFirstTries).toBe(1);
  });

  it('is case-insensitive and ignores leading punctuation in the key', () => {
    const attempt = startVerseAttempt(TEXT, REF, 3);
    expect(applyKey(attempt, 'F').result).toBe('correct');
    expect(applyKey(attempt, '"f').result).toBe('correct');
  });

  it('matches reference digits literally (16 -> type 1)', () => {
    let attempt = startVerseAttempt(TEXT, REF, 3);
    // Walk to the final '16' token.
    for (const key of ['f', 'g', 's', 'l', 'm', 'j', '3']) {
      attempt = applyKey(attempt, key).attempt;
    }
    expect(applyKey(attempt, '6').result).toBe('incorrect');
    expect(applyKey(attempt, '1').result).toBe('correct');
  });

  it('marks a wrong key incorrect without advancing', () => {
    const attempt = startVerseAttempt(TEXT, REF, 3);
    const { attempt: next, result, revealedIndex } = applyKey(attempt, 'x');
    expect(result).toBe('incorrect');
    expect(revealedIndex).toBeNull();
    expect(next.currentIndex).toBe(0);
    expect(next.mistakeOnCurrent).toBe(true);
  });

  it('does not credit a first-try when the token was already missed', () => {
    let attempt = startVerseAttempt(TEXT, REF, 3);
    attempt = applyKey(attempt, 'x').attempt; // miss
    attempt = applyKey(attempt, 'f').attempt; // recover
    expect(attempt.currentIndex).toBe(1);
    expect(attempt.correctFirstTries).toBe(0); // no first-try credit after a miss
    expect(attempt.mistakeOnCurrent).toBe(false); // reset for the next token
  });

  it('completes after the final token and then ignores further keys', () => {
    let attempt = startVerseAttempt(TEXT, REF, 3);
    for (const key of ['f', 'g', 's', 'l', 'm', 'j', '3', '1']) {
      attempt = applyKey(attempt, key).attempt;
    }
    expect(attempt.status).toBe('complete');
    expect(attempt.currentIndex).toBe(8);

    const after = applyKey(attempt, 'z');
    expect(after.result).toBe('ignored');
    expect(after.attempt).toBe(attempt); // unchanged reference
  });

  it('does not mutate the input attempt (pure)', () => {
    const attempt = startVerseAttempt(TEXT, REF, 3);
    applyKey(attempt, 'f');
    expect(attempt.currentIndex).toBe(0);
    expect(attempt.correctFirstTries).toBe(0);
  });
});

describe('attemptAccuracy', () => {
  it('is 1.0 for a flawless attempt', () => {
    let attempt = startVerseAttempt(TEXT, REF, 3);
    for (const key of ['f', 'g', 's', 'l', 'm', 'j', '3', '1']) {
      attempt = applyKey(attempt, key).attempt;
    }
    expect(attemptAccuracy(attempt)).toBe(1);
  });

  it('drops for each token missed on the first try', () => {
    let attempt = startVerseAttempt(TEXT, REF, 3);
    attempt = applyKey(attempt, 'x').attempt; // miss token 0
    for (const key of ['f', 'g', 's', 'l', 'm', 'j', '3', '1']) {
      attempt = applyKey(attempt, key).attempt;
    }
    expect(attemptAccuracy(attempt)).toBe(7 / 8); // 7 of 8 correct first-try
  });
});

describe('isRevealed', () => {
  it('tier 1 shows every token from the start', () => {
    const attempt = startVerseAttempt(TEXT, REF, 1);
    expect(isRevealed(attempt, 0)).toBe(true);
    expect(isRevealed(attempt, 7)).toBe(true);
  });

  it('tier 3 reveals a token only once it has been answered', () => {
    let attempt = startVerseAttempt(TEXT, REF, 3);
    expect(isRevealed(attempt, 0)).toBe(false);
    attempt = applyKey(attempt, 'f').attempt;
    expect(isRevealed(attempt, 0)).toBe(true); // answered
    expect(isRevealed(attempt, 1)).toBe(false); // not yet reached
  });
});
