/**
 * First-letter engine types. Pure data — no I/O, no React, no clock.
 */

export interface Token {
  /** The word exactly as it appears, with punctuation attached (e.g. 'world,'). */
  raw: string;
  /**
   * The key the user must type to reveal this token: a letter (lowercased) or,
   * for reference numbers, the leading digit (e.g. '16' -> '1'). Empty only for
   * tokens with no letter or digit, which tokenize() never emits.
   */
  firstLetter: string;
  /** True for the trailing scripture reference tokens (book, chapter, verse). */
  isReference: boolean;
}

/** 1 = every word shown, 2 = about half hidden, 3 = nothing shown. */
export type Tier = 1 | 2 | 3;
