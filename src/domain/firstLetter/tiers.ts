import type { Tier, Token } from './types';

/**
 * mulberry32: a tiny, fast, seedable PRNG. We need our own (not Math.random)
 * so tier-2 word selection is fully deterministic given a seed, which keeps the
 * engine pure and its tests reproducible.
 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher-Yates shuffle driven by the given PRNG. */
function shuffle(values: number[], random: () => number): number[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Which token indexes are hidden at a given difficulty tier:
 * - Tier 1: nothing hidden (warm-up, every word visible).
 * - Tier 2: about half hidden — a deterministic selection driven by `seed` so a
 *   verse hides a stable set of words per session, but different seeds vary it.
 * - Tier 3: everything hidden (full recall, including the reference).
 */
export function hiddenIndexesForTier(tokens: Token[], tier: Tier, seed = 0): Set<number> {
  const allIndexes = tokens.map((_, index) => index);

  if (tier === 1) return new Set();
  if (tier === 3) return new Set(allIndexes);

  const hideCount = Math.floor(tokens.length / 2);
  const shuffled = shuffle(allIndexes, createRandom(seed));
  return new Set(shuffled.slice(0, hideCount));
}
