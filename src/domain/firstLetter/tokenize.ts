import type { Token } from './types';

// Matches the first "letter or number" in a string, skipping punctuation/quotes.
const ALPHANUMERIC = /[\p{L}\p{N}]/u;

/**
 * The key the user types to reveal a word: the first letter (lowercased) or
 * digit, ignoring any leading punctuation or quotes. Returns '' when the input
 * has no letter or digit. This is the single source of truth for "first letter"
 * so tokenize() and isCorrectFirstLetter() can never disagree.
 */
export function deriveFirstLetter(raw: string): string {
  const match = raw.match(ALPHANUMERIC);
  // toLowerCase is a no-op on digits, so this unifies letters and numbers.
  return match ? match[0].toLowerCase() : '';
}

/** Split on whitespace, dropping empties and stray pure-punctuation fragments. */
function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => ALPHANUMERIC.test(word));
}

/**
 * A reference splits on whitespace AND ':' so the chapter and verse become their
 * own literal-digit tokens (e.g. 'John 3:16' -> ['John', '3', '16']), matching
 * how the reference is memorized ("... J 3 16"). Verse ranges stay intact
 * ('4-7' is one token whose first letter is '4').
 */
function splitReference(reference: string): string[] {
  return reference
    .split(/\s+/)
    .flatMap((part) => part.split(':'))
    .map((part) => part.trim())
    .filter((part) => ALPHANUMERIC.test(part));
}

/**
 * Split a verse plus its reference into ordered tokens: the verse words first,
 * then the reference tokens (marked isReference). Punctuation stays attached to
 * its word rather than becoming a separate token.
 */
export function tokenize(verseText: string, reference: string): Token[] {
  const verseTokens: Token[] = splitWords(verseText).map((raw) => ({
    raw,
    firstLetter: deriveFirstLetter(raw),
    isReference: false,
  }));

  const referenceTokens: Token[] = splitReference(reference).map((raw) => ({
    raw,
    firstLetter: deriveFirstLetter(raw),
    isReference: true,
  }));

  return [...verseTokens, ...referenceTokens];
}
