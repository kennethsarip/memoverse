import { hiddenIndexesForTier, tokenize } from '@/domain/firstLetter';

const tokens = tokenize(
  'For God so loved the world, that he gave his one and only Son.',
  'John 3:16',
);

describe('hiddenIndexesForTier', () => {
  it('tier 1 shows every word (nothing hidden)', () => {
    expect(hiddenIndexesForTier(tokens, 1).size).toBe(0);
  });

  it('tier 3 hides every word', () => {
    const hidden = hiddenIndexesForTier(tokens, 3);
    expect(hidden.size).toBe(tokens.length);
    for (let i = 0; i < tokens.length; i++) {
      expect(hidden.has(i)).toBe(true);
    }
  });

  it('tier 2 hides about half of the words', () => {
    const hidden = hiddenIndexesForTier(tokens, 2);
    expect(hidden.size).toBe(Math.floor(tokens.length / 2));
  });

  it('tier 2 only ever returns valid in-range indexes', () => {
    const hidden = hiddenIndexesForTier(tokens, 2);
    for (const index of hidden) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(tokens.length);
    }
  });

  it('tier 2 is deterministic for the same seed', () => {
    const a = hiddenIndexesForTier(tokens, 2, 42);
    const b = hiddenIndexesForTier(tokens, 2, 42);
    expect([...a].sort()).toEqual([...b].sort());
  });

  it('tier 2 defaults to a stable seed when none is provided', () => {
    const withDefault = hiddenIndexesForTier(tokens, 2);
    const withZero = hiddenIndexesForTier(tokens, 2, 0);
    expect([...withDefault].sort()).toEqual([...withZero].sort());
  });

  it('different seeds can select different words', () => {
    const a = hiddenIndexesForTier(tokens, 2, 1);
    const b = hiddenIndexesForTier(tokens, 2, 999);
    // Same count, but the selected sets should not be identical for these seeds.
    expect(a.size).toBe(b.size);
    expect([...a].sort()).not.toEqual([...b].sort());
  });

  it('handles an empty token list without error', () => {
    expect(hiddenIndexesForTier([], 1).size).toBe(0);
    expect(hiddenIndexesForTier([], 2).size).toBe(0);
    expect(hiddenIndexesForTier([], 3).size).toBe(0);
  });
});
